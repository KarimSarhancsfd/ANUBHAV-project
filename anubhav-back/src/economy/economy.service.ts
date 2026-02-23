/**
 * @file economy.service.ts
 * @description Core economy service handling wallet operations, currency management, and transaction logging.
 * Provides atomic operations for adding/deducting coins and gems with real-time updates.
 */
import { Injectable, Logger, BadRequestException, NotFoundException, Inject, forwardRef, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';
import { CurrencyType, TransactionType } from './enums/economy.enums';
import { ChatGateway } from '../chat/chat.gateway';

/**
 * @class EconomyService
 * @description Service for managing user wallets, currencies, and transactions.
 * Handles atomic currency operations with idempotency support and real-time wallet updates.
 */
@Injectable()
export class EconomyService {
  private readonly logger = new Logger(EconomyService.name);

  /**
   * @constructor
   * @param {Repository<Wallet>} walletRepository - TypeORM repository for Wallet entity
   * @param {Repository<Transaction>} transactionRepository - TypeORM repository for Transaction entity
   * @param {DataSource} dataSource - Database data source for transactions
   * @param {ChatGateway} chatGateway - Optional WebSocket gateway for real-time updates
   */
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private dataSource: DataSource,
    @Optional()
    @Inject(forwardRef(() => ChatGateway))
    private chatGateway?: ChatGateway,
  ) {}

  /**
   * @method getOrCreateWallet
   * @description Retrieves an existing wallet for a user or creates a new one with zero balance if none exists.
   * @param {number} userId - The unique identifier of the user
   * @returns {Promise<Wallet>} The user's wallet entity
   */
  async getOrCreateWallet(userId: number): Promise<Wallet> {
    let wallet = await this.walletRepository.findOne({
      where: { userId },
    });

    if (!wallet) {
      wallet = this.walletRepository.create({
        userId,
        coins: 0,
        gems: 0,
      });
      await this.walletRepository.save(wallet);
    }

    return wallet;
  }

  /**
   * @method getWallet
   * @description Retrieves the user's wallet, creating one if it doesn't exist.
   * @param {number} userId - The unique identifier of the user
   * @returns {Promise<Wallet>} The user's wallet entity with current balances
   */
  async getWallet(userId: number): Promise<Wallet> {
    return this.getOrCreateWallet(userId);
  }

  /**
   * @method getBalance
   * @description Retrieves the specific currency balance (coins or gems) for a user.
   * @param {number} userId - The unique identifier of the user
   * @param {CurrencyType} currencyType - The type of currency to check (COINS or GEMS)
   * @returns {Promise<number>} The current balance of the specified currency
   */
  async getBalance(userId: number, currencyType: CurrencyType): Promise<number> {
    const wallet = await this.getOrCreateWallet(userId);
    return currencyType === CurrencyType.COINS ? wallet.coins : wallet.gems;
  }

  /**
   * @method addCurrency
   * @description Atomically adds currency to a user's wallet with optional idempotency support.
   * Uses database transactions to ensure atomicity and pessimistic locking for concurrency.
   * @param {number} userId - The unique identifier of the user
   * @param {CurrencyType} currencyType - The type of currency to add (COINS or GEMS)
   * @param {number} amount - The amount of currency to add (must be positive)
   * @param {string} reason - Description of why the currency is being added
   * @param {TransactionType} [transactionType=TransactionType.REWARD] - Type of transaction for record-keeping
   * @param {Record<string, any>} [metadata] - Optional additional data to store with the transaction
   * @param {string} [idempotencyKey] - Optional key to prevent duplicate operations
   * @param {string} [referenceId] - Optional external reference ID
   * @param {EntityManager} [manager] - Optional entity manager for transactional context
   * @returns {Promise<Wallet>} The updated wallet with new balance
   * @throws {BadRequestException} If amount is not positive
   * @throws {NotFoundException} If wallet does not exist
   */
  async addCurrency(
    userId: number,
    currencyType: CurrencyType,
    amount: number,
    reason: string,
    transactionType: TransactionType = TransactionType.REWARD,
    metadata?: Record<string, any>,
    idempotencyKey?: string,
    referenceId?: string,
    manager?: EntityManager,
  ): Promise<Wallet> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    if (manager) {
      return this.addCurrencyWithManager(
        manager,
        userId,
        currencyType,
        amount,
        reason,
        transactionType,
        metadata,
        idempotencyKey,
        referenceId,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await this.addCurrencyWithManager(
        queryRunner.manager,
        userId,
        currencyType,
        amount,
        reason,
        transactionType,
        metadata,
        idempotencyKey,
        referenceId,
      );
      await queryRunner.commitTransaction();
      return wallet;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async addCurrencyWithManager(
    manager: EntityManager,
    userId: number,
    currencyType: CurrencyType,
    amount: number,
    reason: string,
    transactionType: TransactionType,
    metadata?: Record<string, any>,
    idempotencyKey?: string,
    referenceId?: string,
  ): Promise<Wallet> {
    // Check idempotency
    if (idempotencyKey) {
      const existingTx = await manager.findOne(Transaction, {
        where: { idempotencyKey },
      });
      if (existingTx) {
        // PERF-FIX: Previously called getOrCreateWallet() here which uses the main
        // repository, outside the active transaction's EntityManager context — breaking
        // transaction isolation. Now correctly reads wallet via the provided manager.
        const existingWallet = await manager.findOne(Wallet, { where: { userId } });
        return existingWallet ?? (await this.getOrCreateWallet(userId));
      }
    }

    // Get wallet with lock
    // PERF: In high-concurrency wallet updates, we lock the specific row.
    const wallet = await manager.findOne(Wallet, {
      where: { userId },
      lock: { mode: 'pessimistic_write' },
      // Select only required fields to reduce payload
      select: ['id', 'userId', 'coins', 'gems'],
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const balanceBefore =
      currencyType === CurrencyType.COINS ? wallet.coins : wallet.gems;
    const balanceAfter = Number(balanceBefore) + Number(amount);

    // Update wallet
    if (currencyType === CurrencyType.COINS) {
      wallet.coins = balanceAfter;
    } else {
      wallet.gems = balanceAfter;
    }

    await manager.save(wallet);

    // Record transaction
    const transaction = manager.create(Transaction, {
      userId,
      type: transactionType,
      currencyType,
      amount,
      balanceBefore,
      balanceAfter,
      reason,
      idempotencyKey,
      referenceId,
      metadata,
    });

    await manager.save(transaction);

    // Emit real-time wallet update (outside of transaction completion here, usually handled by the caller or by post-commit hook if available, but we'll do it here for simplicity as it's not critical)
    try {
      if (this.chatGateway) {
        this.chatGateway.emitWalletUpdate(userId, wallet);
      }
    } catch (error) {
      this.logger.error('Failed to emit wallet update:', error);
    }

    return wallet;
  }

  /**
   * @method deductCurrency
   * @description Atomically deducts currency from a user's wallet with balance verification.
   * Uses database transactions and pessimistic locking to ensure atomicity and prevent overdrafts.
   * @param {number} userId - The unique identifier of the user
   * @param {CurrencyType} currencyType - The type of currency to deduct (COINS or GEMS)
   * @param {number} amount - The amount of currency to deduct (must be positive)
   * @param {string} reason - Description of why the currency is being deducted
   * @param {TransactionType} [transactionType=TransactionType.SPEND] - Type of transaction for record-keeping
   * @param {Record<string, any>} [metadata] - Optional additional data to store with the transaction
   * @param {string} [idempotencyKey] - Optional key to prevent duplicate operations
   * @param {string} [referenceId] - Optional external reference ID
   * @param {EntityManager} [manager] - Optional entity manager for transactional context
   * @returns {Promise<Wallet>} The updated wallet with new balance
   * @throws {BadRequestException} If amount is not positive or insufficient balance
   * @throws {NotFoundException} If wallet does not exist
   */
  async deductCurrency(
    userId: number,
    currencyType: CurrencyType,
    amount: number,
    reason: string,
    transactionType: TransactionType = TransactionType.SPEND,
    metadata?: Record<string, any>,
    idempotencyKey?: string,
    referenceId?: string,
    manager?: EntityManager,
  ): Promise<Wallet> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    if (manager) {
      return this.deductCurrencyWithManager(
        manager,
        userId,
        currencyType,
        amount,
        reason,
        transactionType,
        metadata,
        idempotencyKey,
        referenceId,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await this.deductCurrencyWithManager(
        queryRunner.manager,
        userId,
        currencyType,
        amount,
        reason,
        transactionType,
        metadata,
        idempotencyKey,
        referenceId,
      );
      await queryRunner.commitTransaction();
      return wallet;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async deductCurrencyWithManager(
    manager: EntityManager,
    userId: number,
    currencyType: CurrencyType,
    amount: number,
    reason: string,
    transactionType: TransactionType,
    metadata?: Record<string, any>,
    idempotencyKey?: string,
    referenceId?: string,
  ): Promise<Wallet> {
    // Check idempotency
    if (idempotencyKey) {
      const existingTx = await manager.findOne(Transaction, {
        where: { idempotencyKey },
      });
      if (existingTx) {
        // PERF-FIX: Use manager to stay within transaction context on idempotency hit.
        const existingWallet = await manager.findOne(Wallet, { where: { userId } });
        return existingWallet ?? (await this.getOrCreateWallet(userId));
      }
    }

    // Get wallet with lock
    const wallet = await manager.findOne(Wallet, {
      where: { userId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const balanceBefore =
      currencyType === CurrencyType.COINS ? wallet.coins : wallet.gems;

    // Check sufficient balance
    if (Number(balanceBefore) < Number(amount)) {
      throw new BadRequestException('Insufficient balance');
    }

    const balanceAfter = Number(balanceBefore) - Number(amount);

    // Update wallet
    if (currencyType === CurrencyType.COINS) {
      wallet.coins = balanceAfter;
    } else {
      wallet.gems = balanceAfter;
    }

    await manager.save(wallet);

    // Record transaction (negative amount)
    const transaction = manager.create(Transaction, {
      userId,
      type: transactionType,
      currencyType,
      amount: -amount,
      balanceBefore,
      balanceAfter,
      reason,
      idempotencyKey,
      referenceId,
      metadata,
    });

    await manager.save(transaction);

    // Emit real-time wallet update
    try {
      if (this.chatGateway) {
        this.chatGateway.emitWalletUpdate(userId, wallet);
      }
    } catch (error) {
      this.logger.error('Failed to emit wallet update:', error);
    }

    return wallet;
  }

  /**
   * @method getTransactionHistory
   * @description Retrieves the transaction history for a user with pagination support.
   * Returns transactions in descending order by creation date.
   * @param {number} userId - The unique identifier of the user
   * @param {number} [limit=50] - Maximum number of transactions to return
   * @param {number} [offset=0] - Number of transactions to skip for pagination
   * @returns {Promise<Transaction[]>} Array of transaction entities
   */
  async getTransactionHistory(
    userId: number,
    limit: number = 50,
    offset: number = 0,
  ): Promise<Transaction[]> {
    // PERF: Combined index on [userId, createdAt] in Transaction entity
    // makes this query O(log n) even with millions of records.
    return this.transactionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
      select: ['id', 'userId', 'type', 'currencyType', 'amount', 'balanceAfter', 'reason', 'createdAt'],
    });
  }

  /**
   * @method recordTransaction
   * @description Records a transaction in the transaction history without modifying wallet balance.
   * Used for internal bookkeeping and audit trails.
   * @param {number} userId - The unique identifier of the user
   * @param {TransactionType} type - The type of transaction being recorded
   * @param {CurrencyType} currencyType - The type of currency involved
   * @param {number} amount - The amount of currency (positive or negative)
   * @param {number} balanceBefore - The wallet balance before the transaction
   * @param {number} balanceAfter - The wallet balance after the transaction
   * @param {string} reason - Description of why the transaction occurred
   * @param {Record<string, any>} [metadata] - Optional additional data to store
   * @returns {Promise<Transaction>} The created transaction entity
   */
  async recordTransaction(
    userId: number,
    type: TransactionType,
    currencyType: CurrencyType,
    amount: number,
    balanceBefore: number,
    balanceAfter: number,
    reason: string,
    metadata?: Record<string, any>,
  ): Promise<Transaction> {
    const transaction = this.transactionRepository.create({
      userId,
      type,
      currencyType,
      amount,
      balanceBefore,
      balanceAfter,
      reason,
      metadata,
    });

    return this.transactionRepository.save(transaction);
  }
}

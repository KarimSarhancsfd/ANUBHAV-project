import { Injectable, Logger, BadRequestException, NotFoundException, Inject, forwardRef, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';
import { CurrencyType, TransactionType } from './enums/economy.enums';
import { ChatGateway } from '../chat/chat.gateway';

@Injectable()
export class EconomyService {
  private readonly logger = new Logger(EconomyService.name);

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
   * Get or create wallet for user
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
   * Get wallet balance
   */
  async getWallet(userId: number): Promise<Wallet> {
    return this.getOrCreateWallet(userId);
  }

  /**
   * Get specific currency balance
   */
  async getBalance(userId: number, currencyType: CurrencyType): Promise<number> {
    const wallet = await this.getOrCreateWallet(userId);
    return currencyType === CurrencyType.COINS ? wallet.coins : wallet.gems;
  }

  /**
   * Add currency to wallet (atomic operation)
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
   * Deduct currency from wallet (atomic operation with balance check)
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
   * Get transaction history
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
   * Record transaction (internal use)
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

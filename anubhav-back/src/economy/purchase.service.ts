/**
 * @file purchase.service.ts
 * @description Purchase service handling in-app product purchases and payment processing.
 * Manages product catalog, purchase initiation, payment verification, and currency fulfillment.
 */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Purchase } from './entities/purchase.entity';
import { PurchaseStatus, CurrencyType, TransactionType } from './enums/economy.enums';
import { EconomyService } from './economy.service';
import { PaymentService } from './payment.service';

// Product catalog (in production, this would be in database or config)
const PRODUCT_CATALOG = {
  coins_pack_100: { coins: 100, gems: 0, price: 0.99, currency: 'USD' },
  coins_pack_500: { coins: 500, gems: 0, price: 4.99, currency: 'USD' },
  coins_pack_1000: { coins: 1000, gems: 0, price: 9.99, currency: 'USD' },
  gems_pack_10: { coins: 0, gems: 10, price: 0.99, currency: 'USD' },
  gems_pack_50: { coins: 0, gems: 50, price: 4.99, currency: 'USD' },
  gems_pack_100: { coins: 0, gems: 100, price: 9.99, currency: 'USD' },
  starter_pack: { coins: 500, gems: 10, price: 4.99, currency: 'USD' },
};

/**
 * @class PurchaseService
 * @description Service for managing in-app purchases, product catalog, and payment workflows.
 * Handles purchase initiation, payment verification, and automatic currency fulfillment.
 */
@Injectable()
export class PurchaseService {
  private purchaseAttempts: Map<number, number[]> = new Map();

  /**
   * @constructor
   * @param {Repository<Purchase>} purchaseRepository - TypeORM repository for Purchase entity
   * @param {EconomyService} economyService - Service for managing user currencies
   * @param {PaymentService} paymentService - Service for payment processing
   * @param {DataSource} dataSource - Database data source for transactions
   */
  constructor(
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    private economyService: EconomyService,
    private paymentService: PaymentService,
    private dataSource: DataSource,
  ) {}

  /**
   * Rate limiting check (max 5 purchases per minute)
   */
  private checkRateLimit(userId: number): void {
    const now = Date.now();
    const userAttempts = this.purchaseAttempts.get(userId) || [];

    // Filter attempts from last minute
    const recentAttempts = userAttempts.filter(
      (timestamp) => now - timestamp < 60000,
    );

    if (recentAttempts.length >= 5) {
      throw new BadRequestException(
        'Rate limit exceeded. Please wait before making another purchase.',
      );
    }

    recentAttempts.push(now);
    this.purchaseAttempts.set(userId, recentAttempts);
  }

  /**
   * @method initiatePurchase
   * @description Initiates a new purchase by creating a payment intent and purchase record.
   * Includes rate limiting to prevent purchase abuse.
   * @param {number} userId - The unique identifier of the user making the purchase
   * @param {string} productId - The identifier of the product being purchased
   * @param {string} idempotencyKey - Unique key to prevent duplicate purchases
   * @returns {Promise<{purchase: Purchase, paymentIntent: any}>} Purchase record and payment intent
   * @throws {BadRequestException} If product ID is invalid or rate limit exceeded
   */
  async initiatePurchase(
    userId: number,
    productId: string,
    idempotencyKey: string,
  ): Promise<{ purchase: Purchase; paymentIntent: any }> {
    // Rate limiting
    this.checkRateLimit(userId);

    // Validate product
    const product = PRODUCT_CATALOG[productId];
    if (!product) {
      throw new BadRequestException('Invalid product ID');
    }

    // Check for duplicate idempotency key
    const existingPurchase = await this.purchaseRepository.findOne({
      where: { idempotencyKey },
    });

    if (existingPurchase) {
      // Return existing purchase if already completed
      if (existingPurchase.status === PurchaseStatus.COMPLETED) {
        return {
          purchase: existingPurchase,
          paymentIntent: { id: existingPurchase.paymentId, status: 'completed' },
        };
      }

      // Return existing pending purchase
      return {
        purchase: existingPurchase,
        paymentIntent: { id: existingPurchase.paymentId, status: 'pending' },
      };
    }

    // Create payment intent
    const paymentIntent = await this.paymentService.createPaymentIntent(
      product.price,
      product.currency,
      { userId, productId },
    );

    // Create purchase record
    const purchase = this.purchaseRepository.create({
      userId,
      productId,
      amount: product.price,
      currency: product.currency,
      status: PurchaseStatus.PENDING,
      paymentProvider: 'mock',
      paymentId: paymentIntent.id,
      idempotencyKey,
      metadata: { product },
    });

    await this.purchaseRepository.save(purchase);

    return { purchase, paymentIntent };
  }

  /**
   * @method verifyAndCompletePurchase
   * @description Verifies payment with the payment provider and completes the purchase atomically.
   * Grants the appropriate currency (coins/gems) to the user's wallet upon successful verification.
   * @param {number} purchaseId - The unique identifier of the purchase to verify
   * @param {string} paymentId - The payment provider's payment ID for verification
   * @returns {Promise<Purchase>} The completed purchase entity
   * @throws {NotFoundException} If purchase is not found
   * @throws {BadRequestException} If payment verification fails or payment ID mismatch
   */
  async verifyAndCompletePurchase(
    purchaseId: number,
    paymentId: string,
  ): Promise<Purchase> {
    const purchase = await this.purchaseRepository.findOne({
      where: { id: purchaseId },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    if (purchase.status === PurchaseStatus.COMPLETED) {
      return purchase; // Already completed (idempotent)
    }

    if (purchase.paymentId !== paymentId) {
      throw new BadRequestException('Payment ID mismatch');
    }

    // Verify payment with payment provider
    const verification = await this.paymentService.verifyPayment(paymentId);

    if (!verification.success) {
      purchase.status = PurchaseStatus.FAILED;
      await this.purchaseRepository.save(purchase);
      throw new BadRequestException('Payment verification failed');
    }

    // Grant currency and complete purchase atomically
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      const product = purchase.metadata?.product || PRODUCT_CATALOG[purchase.productId];

      if (product.coins > 0) {
        await this.economyService.addCurrency(
          purchase.userId,
          CurrencyType.COINS,
          product.coins,
          `Purchase: ${purchase.productId}`,
          TransactionType.PURCHASE,
          { purchaseId: purchase.id },
          `purchase_coins:${purchase.id}`, // Idempotency key
          undefined,
          manager,
        );
      }

      if (product.gems > 0) {
        await this.economyService.addCurrency(
          purchase.userId,
          CurrencyType.GEMS,
          product.gems,
          `Purchase: ${purchase.productId}`,
          TransactionType.PURCHASE,
          { purchaseId: purchase.id },
          `purchase_gems:${purchase.id}`, // Idempotency key
          undefined,
          manager,
        );
      }

      // Update purchase status
      purchase.status = PurchaseStatus.COMPLETED;
      purchase.verifiedAt = new Date();
      return await manager.save(purchase);
    });
  }

  /**
   * @method getPurchase
   * @description Retrieves a specific purchase by its unique ID.
   * @param {number} purchaseId - The unique identifier of the purchase
   * @returns {Promise<Purchase>} The purchase entity
   * @throws {NotFoundException} If purchase is not found
   */
  async getPurchase(purchaseId: number): Promise<Purchase> {
    const purchase = await this.purchaseRepository.findOne({
      where: { id: purchaseId },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    return purchase;
  }

  /**
   * @method getUserPurchases
   * @description Retrieves the purchase history for a user with pagination support.
   * Returns purchases in descending order by creation date.
   * @param {number} userId - The unique identifier of the user
   * @param {number} [limit=50] - Maximum number of purchases to return
   * @param {number} [offset=0] - Number of purchases to skip for pagination
   * @returns {Promise<Purchase[]>} Array of purchase entities
   */
  async getUserPurchases(
    userId: number,
    limit: number = 50,
    offset: number = 0,
  ): Promise<Purchase[]> {
    return this.purchaseRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
      select: ['id', 'userId', 'productId', 'amount', 'currency', 'status', 'createdAt'],
    });
  }

  /**
   * @method getProductCatalog
   * @description Returns the complete product catalog with available in-app purchase items.
   * @returns {typeof PRODUCT_CATALOG} The product catalog object containing all available products
   */
  getProductCatalog(): typeof PRODUCT_CATALOG {
    return PRODUCT_CATALOG;
  }
}

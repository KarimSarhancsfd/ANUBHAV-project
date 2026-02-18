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

@Injectable()
export class PurchaseService {
  private purchaseAttempts: Map<number, number[]> = new Map();

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
   * Initiate purchase
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
   * Verify and complete purchase
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
   * Get purchase by ID
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
   * Get user purchase history
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
    });
  }

  /**
   * Get product catalog
   */
  getProductCatalog(): typeof PRODUCT_CATALOG {
    return PRODUCT_CATALOG;
  }
}

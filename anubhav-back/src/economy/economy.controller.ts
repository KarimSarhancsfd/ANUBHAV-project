/**
 * @file economy.controller.ts
 * @description Economy controller handling all in-game economy operations.
 * Manages wallets, transactions, purchases, inventory, and admin operations.
 * Requires JWT authentication and role-based authorization.
 */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { EconomyService } from './economy.service';
import { PurchaseService } from './purchase.service';
import { InventoryService } from './inventory.service';
import {
  InitiatePurchaseDto,
  VerifyPaymentDto,
  PurchaseItemDto,
  AddCurrencyDto,
  GrantItemDto,
} from './dto/economy.dto';
import { CurrencyType, ItemType, TransactionType } from './enums/economy.enums';

import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Role } from '../auth/decorator/roles.decorator';

/**
 * @class EconomyController
 * @description Controller for in-game economy management.
 * Handles wallets, transactions, purchases, inventory, and admin functions.
 */
@Controller('economy')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EconomyController {
  constructor(
    private readonly economyService: EconomyService,
    private readonly purchaseService: PurchaseService,
    private readonly inventoryService: InventoryService,
  ) {}

  // ==================== WALLET ENDPOINTS ====================

  /**
   * @route GET /economy/wallet
   * @description Retrieves player's wallet with currency balances.
   * @security JwtAuthGuard required
   * @returns {Object} Wallet data including currency balances
   */
  @Get('wallet')
  async getWallet(@Request() req) {
    const userId = req.user.id;
    return this.economyService.getWallet(Number(userId));
  }

  /**
   * @route GET /economy/transactions
   * @description Retrieves player's transaction history with pagination.
   * @security JwtAuthGuard required
   * @param {string} limit - Maximum records to return (default 50)
   * @param {string} offset - Records to skip (default 0)
   * @returns {Object} Paginated transaction history
   */
  @Get('transactions')
  async getTransactions(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const userId = req.user.id;
    return this.economyService.getTransactionHistory(
      Number(userId),
      limit ? Number(limit) : 50,
      offset ? Number(offset) : 0,
    );
  }

  // ==================== PURCHASE ENDPOINTS ====================

  /**
   * @route GET /economy/products
   * @description Retrieves available products in the catalog.
   * @returns {Object} Product catalog listing
   */
  @Get('products')
  getProducts() {
    return this.purchaseService.getProductCatalog();
  }

  /**
   * @route POST /economy/purchase/initiate
   * @description Initiates a purchase transaction.
   * @security JwtAuthGuard required
   * @param {InitiatePurchaseDto} dto - Purchase initiation data
   * @returns {Object} Purchase details for payment
   */
  @Post('purchase/initiate')
  async initiatePurchase(@Request() req, @Body() dto: InitiatePurchaseDto) {
    const userId = req.user.id;
    return this.purchaseService.initiatePurchase(
      Number(userId),
      dto.productId,
      dto.idempotencyKey,
    );
  }

  /**
   * @route POST /economy/purchase/verify
   * @description Verifies and completes a purchase transaction.
   * @param {VerifyPaymentDto} dto - Payment verification data
   * @returns {Object} Purchase completion status
   */
  @Post('purchase/verify')
  async verifyPurchase(@Body() dto: VerifyPaymentDto) {
    return this.purchaseService.verifyAndCompletePurchase(
      dto.purchaseId,
      dto.paymentId,
    );
  }

  /**
   * @route GET /economy/purchase/:id
   * @description Retrieves purchase status by ID.
   * @param {string} id - Purchase ID
   * @returns {Object} Purchase details
   */
  @Get('purchase/:id')
  async getPurchase(@Param('id') id: string) {
    return this.purchaseService.getPurchase(Number(id));
  }

  /**
   * @route GET /economy/purchases
   * @description Retrieves user's purchase history.
   * @security JwtAuthGuard required
   * @param {string} limit - Maximum records (default 50)
   * @param {string} offset - Records to skip (default 0)
   * @returns {Object} Paginated purchase history
   */
  @Get('purchases')
  async getUserPurchases(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const userId = req.user.id;
    return this.purchaseService.getUserPurchases(
      Number(userId),
      limit ? Number(limit) : 50,
      offset ? Number(offset) : 0,
    );
  }

  // ==================== INVENTORY ENDPOINTS ====================

  /**
   * @route GET /economy/inventory
   * @description Retrieves player's inventory items.
   * @security JwtAuthGuard required
   * @param {ItemType} itemType - Optional filter by item type
   * @returns {Object} Player's inventory
   */
  @Get('inventory')
  async getInventory(
    @Request() req,
    @Query('itemType') itemType?: ItemType,
  ) {
    const userId = req.user.id;
    return this.inventoryService.getInventory(Number(userId), itemType);
  }

  /**
   * @route POST /economy/inventory/purchase
   * @description Purchases an item using in-game currency.
   * @security JwtAuthGuard required
   * @param {PurchaseItemDto} dto - Item purchase data
   * @returns {Object} Purchase result
   */
  @Post('inventory/purchase')
  async purchaseItem(@Request() req, @Body() dto: PurchaseItemDto) {
    const userId = req.user.id;
    const itemType = ItemType.SKIN;

    return this.inventoryService.purchaseItem(
      Number(userId),
      dto.itemId,
      itemType,
      dto.price,
      dto.currencyType,
      dto.metadata,
      dto.idempotencyKey,
    );
  }

  // ==================== ADMIN ENDPOINTS ====================

  /**
   * @route POST /economy/admin/grant-currency
   * @description Admin: Grants currency to a player.
   * @security JwtAuthGuard, RolesGuard - admin role required
   * @param {AddCurrencyDto} dto - Currency grant data
   * @returns {Object} Grant result
   */
  @Post('admin/grant-currency')
  @Role('admin')
  async grantCurrency(@Body() dto: AddCurrencyDto) {
    return this.economyService.addCurrency(
      dto.userId,
      dto.currencyType,
      dto.amount,
      dto.reason,
      TransactionType.ADMIN_GRANT,
      dto.metadata,
    );
  }

  /**
   * @route POST /economy/admin/grant-item
   * @description Admin: Grants an item to a player.
   * @security JwtAuthGuard, RolesGuard - admin role required
   * @param {GrantItemDto} dto - Item grant data
   * @returns {Object} Grant result
   */
  @Post('admin/grant-item')
  @Role('admin')
  async grantItem(@Body() dto: GrantItemDto) {
    const itemType = ItemType.SKIN;

    return this.inventoryService.addItem(
      dto.userId,
      dto.itemId,
      itemType,
      dto.quantity,
      dto.metadata,
    );
  }
}

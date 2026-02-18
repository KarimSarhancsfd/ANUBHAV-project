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
   * Get player wallet
   */
  @Get('wallet')
  async getWallet(@Request() req) {
    const userId = req.user.id;
    return this.economyService.getWallet(Number(userId));
  }

  /**
   * Get transaction history
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
   * Get product catalog
   */
  @Get('products')
  getProducts() {
    return this.purchaseService.getProductCatalog();
  }

  /**
   * Initiate purchase
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
   * Verify and complete purchase
   */
  @Post('purchase/verify')
  async verifyPurchase(@Body() dto: VerifyPaymentDto) {
    return this.purchaseService.verifyAndCompletePurchase(
      dto.purchaseId,
      dto.paymentId,
    );
  }

  /**
   * Get purchase status
   */
  @Get('purchase/:id')
  async getPurchase(@Param('id') id: string) {
    return this.purchaseService.getPurchase(Number(id));
  }

  /**
   * Get user purchase history
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
   * Get player inventory
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
   * Purchase item with currency
   */
  @Post('inventory/purchase')
  async purchaseItem(@Request() req, @Body() dto: PurchaseItemDto) {
    const userId = req.user.id;
    
    // In production, item details would come from database/config
    const itemType = ItemType.SKIN; // Example

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
  // In production, these should be protected with role guards

  /**
   * Admin: Grant currency to player
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
   * Admin: Grant item to player
   */
  @Post('admin/grant-item')
  @Role('admin')
  async grantItem(@Body() dto: GrantItemDto) {
    // In production, itemType would come from database
    const itemType = ItemType.SKIN; // Example

    return this.inventoryService.addItem(
      dto.userId,
      dto.itemId,
      itemType,
      dto.quantity,
      dto.metadata,
    );
  }
}

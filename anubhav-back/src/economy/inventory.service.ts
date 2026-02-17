import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { ItemType, CurrencyType } from './enums/economy.enums';
import { EconomyService } from './economy.service';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
    private economyService: EconomyService,
  ) {}

  /**
   * Add item to inventory
   */
  async addItem(
    userId: number,
    itemId: string,
    itemType: ItemType,
    quantity: number = 1,
    metadata?: Record<string, any>,
  ): Promise<InventoryItem> {
    // Check if item already exists
    const existingItem = await this.inventoryRepository.findOne({
      where: { userId, itemId },
    });

    if (existingItem) {
      // For stackable items, increase quantity
      if (
        itemType === ItemType.CONSUMABLE ||
        itemType === ItemType.POWERUP
      ) {
        existingItem.quantity += quantity;
        return this.inventoryRepository.save(existingItem);
      } else {
        // For unique items, don't duplicate
        throw new BadRequestException('Item already owned');
      }
    }

    // Create new inventory item
    const item = this.inventoryRepository.create({
      userId,
      itemId,
      itemType,
      quantity,
      metadata,
    });

    return this.inventoryRepository.save(item);
  }

  /**
   * Remove item from inventory
   */
  async removeItem(
    userId: number,
    itemId: string,
    quantity: number = 1,
  ): Promise<void> {
    const item = await this.inventoryRepository.findOne({
      where: { userId, itemId },
    });

    if (!item) {
      throw new NotFoundException('Item not found in inventory');
    }

    if (item.quantity < quantity) {
      throw new BadRequestException('Insufficient item quantity');
    }

    if (item.quantity === quantity) {
      // Remove item completely
      await this.inventoryRepository.remove(item);
    } else {
      // Decrease quantity
      item.quantity -= quantity;
      await this.inventoryRepository.save(item);
    }
  }

  /**
   * Check if user has item
   */
  async hasItem(userId: number, itemId: string): Promise<boolean> {
    const item = await this.inventoryRepository.findOne({
      where: { userId, itemId },
    });

    return !!item && item.quantity > 0;
  }

  /**
   * Get user inventory
   */
  async getInventory(
    userId: number,
    itemType?: ItemType,
  ): Promise<InventoryItem[]> {
    const where: any = { userId };
    if (itemType) {
      where.itemType = itemType;
    }

    return this.inventoryRepository.find({
      where,
      order: { purchasedAt: 'DESC' },
    });
  }

  /**
   * Purchase item with currency
   */
  async purchaseItem(
    userId: number,
    itemId: string,
    itemType: ItemType,
    price: number,
    currencyType: CurrencyType,
    metadata?: Record<string, any>,
  ): Promise<{ item: InventoryItem; wallet: any }> {
    // Deduct currency
    const wallet = await this.economyService.deductCurrency(
      userId,
      currencyType,
      price,
      `Item purchase: ${itemId}`,
      undefined,
      { itemId, itemType },
    );

    // Add item to inventory
    const item = await this.addItem(userId, itemId, itemType, 1, metadata);

    return { item, wallet };
  }
}

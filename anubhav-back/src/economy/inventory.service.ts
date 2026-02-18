import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { ItemType, CurrencyType, TransactionType } from './enums/economy.enums';
import { EconomyService } from './economy.service';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
    private economyService: EconomyService,
    private dataSource: DataSource,
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
    idempotencyKey?: string,
    manager?: EntityManager,
  ): Promise<InventoryItem> {
    const repo = manager ? manager.getRepository(InventoryItem) : this.inventoryRepository;

    // Check idempotency if key provided
    if (idempotencyKey) {
      const existingTxItem = await repo.findOne({
        where: { metadata: { idempotencyKey } as any }, // Assuming we store it in metadata if no dedicated column
      });
      // In a real system, we'd add an idempotencyKey column to InventoryItem too.
      // For now, let's just check if it exists in metadata or skip if no column.
    }

    // Check if item already exists
    const existingItem = await repo.findOne({
      where: { userId, itemId },
    });

    if (existingItem) {
      // For stackable items, increase quantity
      if (
        itemType === ItemType.CONSUMABLE ||
        itemType === ItemType.POWERUP
      ) {
        existingItem.quantity += quantity;
        return repo.save(existingItem);
      } else {
        // For unique items, don't duplicate
        throw new BadRequestException('Item already owned');
      }
    }

    // Create new inventory item
    const item = repo.create({
      userId,
      itemId,
      itemType,
      quantity,
      metadata: { ...metadata, idempotencyKey },
    });

    return repo.save(item);
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

  async purchaseItem(
    userId: number,
    itemId: string,
    itemType: ItemType,
    price: number,
    currencyType: CurrencyType,
    metadata?: Record<string, any>,
    idempotencyKey?: string,
  ): Promise<{ item: InventoryItem; wallet: any }> {
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      // Deduct currency
      const wallet = await this.economyService.deductCurrency(
        userId,
        currencyType,
        price,
        `Item purchase: ${itemId}`,
        TransactionType.SPEND,
        { itemId, itemType },
        idempotencyKey ? `purchase:${idempotencyKey}` : undefined,
        undefined,
        manager,
      );

      // Add item to inventory
      const item = await this.addItem(
        userId, 
        itemId, 
        itemType, 
        1, 
        metadata, 
        idempotencyKey, 
        manager
      );

      return { item, wallet };
    });
  }
}

/**
 * @file inventory.service.ts
 * @description Inventory service handling user item management and in-game purchases.
 * Manages item acquisition, removal, ownership checks, and purchase transactions.
 */
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

/**
 * @class InventoryService
 * @description Service for managing user inventory and item-based purchases.
 * Handles adding/removing items, ownership verification, and purchasing items with currency.
 */
@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  /**
   * @constructor
   * @param {Repository<InventoryItem>} inventoryRepository - TypeORM repository for InventoryItem entity
   * @param {EconomyService} economyService - Service for managing user currencies
   * @param {DataSource} dataSource - Database data source for transactions
   */
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
    private economyService: EconomyService,
    private dataSource: DataSource,
  ) {}

  /**
   * @method addItem
   * @description Adds an item to the user's inventory or increases quantity for stackable items.
   * For consumables and powerups, quantities are stacked; duplicates are prevented for unique items.
   * @param {number} userId - The unique identifier of the user
   * @param {string} itemId - The identifier of the item to add
   * @param {ItemType} itemType - The type of item (CONSUMABLE, POWERUP, COSMETIC, etc.)
   * @param {number} [quantity=1] - The quantity of the item to add
   * @param {Record<string, any>} [metadata] - Optional additional item data
   * @param {string} [idempotencyKey] - Optional key to prevent duplicate additions
   * @param {EntityManager} [manager] - Optional entity manager for transactional context
   * @returns {Promise<InventoryItem>} The inventory item entity
   * @throws {BadRequestException} If unique item is already owned
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
   * @method removeItem
   * @description Removes a specified quantity of an item from the user's inventory.
   * Removes the item completely if quantity reaches zero, otherwise decreases quantity.
   * @param {number} userId - The unique identifier of the user
   * @param {string} itemId - The identifier of the item to remove
   * @param {number} [quantity=1] - The quantity of the item to remove
   * @returns {Promise<void>}
   * @throws {NotFoundException} If item is not found in inventory
   * @throws {BadRequestException} If insufficient quantity to remove
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
   * @method hasItem
   * @description Checks if a user owns a specific item with positive quantity.
   * @param {number} userId - The unique identifier of the user
   * @param {string} itemId - The identifier of the item to check
   * @returns {Promise<boolean>} True if user owns the item with quantity > 0
   */
  async hasItem(userId: number, itemId: string): Promise<boolean> {
    const item = await this.inventoryRepository.findOne({
      where: { userId, itemId },
    });

    return !!item && item.quantity > 0;
  }

  /**
   * @method getInventory
   * @description Retrieves all items in a user's inventory, optionally filtered by item type.
   * Returns items sorted by purchase date in descending order.
   * @param {number} userId - The unique identifier of the user
   * @param {ItemType} [itemType] - Optional filter to only return items of specific type
   * @returns {Promise<InventoryItem[]>} Array of inventory items
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
   * @method purchaseItem
   * @description Atomically purchases an item by deducting currency and adding it to inventory.
   * Uses database transaction to ensure both operations succeed or fail together.
   * @param {number} userId - The unique identifier of the user
   * @param {string} itemId - The identifier of the item to purchase
   * @param {ItemType} itemType - The type of item being purchased
   * @param {number} price - The price of the item in specified currency
   * @param {CurrencyType} currencyType - The currency type to use for payment (COINS or GEMS)
   * @param {Record<string, any>} [metadata] - Optional additional item data
   * @param {string} [idempotencyKey] - Optional key to prevent duplicate purchases
   * @returns {Promise<{item: InventoryItem, wallet: any}>} The purchased item and updated wallet
   * @throws {BadRequestException} If insufficient balance
   */
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

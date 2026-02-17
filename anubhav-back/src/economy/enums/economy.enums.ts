export enum CurrencyType {
  COINS = 'COINS',
  GEMS = 'GEMS',
}

export enum TransactionType {
  PURCHASE = 'PURCHASE',
  REWARD = 'REWARD',
  SPEND = 'SPEND',
  ADMIN_GRANT = 'ADMIN_GRANT',
  REFUND = 'REFUND',
}

export enum PurchaseStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum ItemType {
  SKIN = 'SKIN',
  POWERUP = 'POWERUP',
  CONSUMABLE = 'CONSUMABLE',
  PERMANENT = 'PERMANENT',
}

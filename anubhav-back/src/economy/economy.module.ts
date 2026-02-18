import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EconomyController } from './economy.controller';
import { EconomyService } from './economy.service';
import { PurchaseService } from './purchase.service';
import { PaymentService } from './payment.service';
import { InventoryService } from './inventory.service';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';
import { Purchase } from './entities/purchase.entity';
import { InventoryItem } from './entities/inventory-item.entity';

import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Wallet,
      Transaction,
      Purchase,
      InventoryItem,
    ]),
    ChatModule,
  ],
  controllers: [EconomyController],
  providers: [
    EconomyService,
    PurchaseService,
    PaymentService,
    InventoryService,
  ],
  exports: [
    EconomyService,
    PurchaseService,
    PaymentService,
    InventoryService,
  ],
})
export class EconomyModule {}

import { IsEnum, IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { CurrencyType, TransactionType } from '../enums/economy.enums';

export class AddCurrencyDto {
  @IsNumber()
  userId: number;

  @IsEnum(CurrencyType)
  currencyType: CurrencyType;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  reason: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class DeductCurrencyDto {
  @IsNumber()
  userId: number;

  @IsEnum(CurrencyType)
  currencyType: CurrencyType;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  reason: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class InitiatePurchaseDto {
  @IsString()
  productId: string;

  @IsString()
  idempotencyKey: string;
}

export class VerifyPaymentDto {
  @IsNumber()
  purchaseId: number;

  @IsString()
  paymentId: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class PurchaseItemDto {
  @IsString()
  itemId: string;

  @IsNumber()
  @Min(1)
  price: number;

  @IsEnum(CurrencyType)
  currencyType: CurrencyType;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class GrantItemDto {
  @IsNumber()
  userId: number;

  @IsString()
  itemId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  metadata?: Record<string, any>;
}

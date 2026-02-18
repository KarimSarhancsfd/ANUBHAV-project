import { IsString, IsNumber, IsEnum, Min, IsOptional, IsNotEmpty } from 'class-validator';
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
  @IsNotEmpty()
  itemId: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsEnum(CurrencyType)
  currencyType: CurrencyType;

  @IsString()
  @IsOptional()
  idempotencyKey?: string;

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

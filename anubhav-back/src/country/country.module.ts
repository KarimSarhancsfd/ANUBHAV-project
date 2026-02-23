/**
 * @file country.module.ts
 * @description NestJS module for configuring country-related dependencies
 */
import { Module } from '@nestjs/common';
import { CountryService } from './country.service';
import { CountryController } from './country.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from './entities/country.entity';

/**
 * Module for configuring country feature dependencies
 */
@Module({
  imports: [TypeOrmModule.forFeature([Country])] , 
  controllers: [CountryController],
  providers: [CountryService],
})
export class CountryModule {}

/**
 * @file Terms module for NestJS application
 * @description Module that configures terms and policies feature with controller and service providers
 */
import { Module } from '@nestjs/common';
import { TermsService } from './terms.service';
import { TermsController } from './terms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Term } from './entities/term.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Term])], 
  controllers: [TermsController],
  providers: [TermsService],
})

/**
 * TermsModule configures the terms and policies feature
 * Imports TypeOrmModule for Term entity and registers controller and service providers
 */
export class TermsModule {}

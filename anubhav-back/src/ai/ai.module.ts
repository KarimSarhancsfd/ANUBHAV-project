/**
 * @file ai.module.ts
 * @description Module responsible for managing AI-related services and controllers.
 * @module AI
 */

import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';

/**
 * AIModule class.
 * Encapsulates the configuration for the AI feature set.
 */
@Module({
  controllers: [AIController],
  providers: [AIService],
  exports: [AIService],
})
export class AIModule {}

/**
 * @file ai.controller.ts
 * @description AI controller handling AI-powered content generation endpoints.
 * Provides summarization and quiz generation using DeepSeek API.
 */
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

/**
 * @class AIController
 * @description Controller for AI-powered content generation endpoints.
 */
@Controller('ai')
@ApiBearerAuth()
export class AIController {
  constructor(private readonly aiService: AIService) {}

  /**
   * @route POST /ai/summary
   * @description Generates an AI-powered summary of provided content.
   * @security JwtAuthGuard required
   * @param {Object} body - Request body containing content to summarize
   * @param {string} body.content - The content to summarize
   * @returns {Object} Generated summary
   */
  @UseGuards(JwtAuthGuard)
  @Post('summary')
  async generateSummary(@Body() body: { content: string }) {
    return {
      summary: await this.aiService.generateBookSummary(body.content),
    };
  }

  /**
   * @route POST /ai/quiz
   * @description Generates quiz questions from provided content using AI.
   * @security JwtAuthGuard required
   * @param {Object} body - Request body containing content for quiz generation
   * @param {string} body.content - The content to generate quiz from
   * @returns {Object} Generated quiz questions
   */
  @UseGuards(JwtAuthGuard)
  @Post('quiz')
  async generateQuiz(@Body() body: { content: string }) {
    return {
      questions: await this.aiService.generateQuiz(body.content),
    };
  }
}

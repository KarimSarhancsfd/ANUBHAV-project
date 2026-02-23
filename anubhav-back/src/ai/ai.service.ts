/**
 * @file ai.service.ts
 * @description AI service integrating with DeepSeek API for content generation.
 * Provides book summarization and quiz generation capabilities.
 */
import { Injectable } from '@nestjs/common';
import axios from 'axios';

/**
 * @class AIService
 * @description Service for AI-powered content generation using DeepSeek API.
 */
@Injectable()
export class AIService {
  private readonly apiKey = process.env.DEEPSEEK_API_KEY;
  private readonly apiUrl = 'https://api.deepseek.com/v1';

  /**
   * @method generateBookSummary
   * @description Generates a summary of book content using AI.
   * @param {string} bookContent - The content to summarize
   * @returns {string} Generated summary
   * @throws {Error} If API call fails
   */
  async generateBookSummary(bookContent: string) {
    try {
      const response = await axios.post(`${this.apiUrl}/summarize`, {
        content: bookContent
      }, {
        headers: { Authorization: `Bearer ${this.apiKey}` }
      });
      return response.data.summary;
    } catch (error) {
      console.error('DeepSeek API Error:', error.response?.data || error.message);
      throw new Error('Failed to generate book summary');
    }
  }

  /**
   * @method generateQuiz
   * @description Generates quiz questions from book content using AI.
   * @param {string} bookContent - The content to generate quiz from
   * @returns {Array} Array of quiz questions
   */
  async generateQuiz(bookContent: string) {
    const response = await axios.post(`${this.apiUrl}/quiz`, {
      content: bookContent
    }, {
      headers: { Authorization: `Bearer ${this.apiKey}` }
    });
    return response.data.questions;
  }
}
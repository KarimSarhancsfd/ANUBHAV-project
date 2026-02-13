import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AIService {
  private readonly apiKey = process.env.DEEPSEEK_API_KEY;
  private readonly apiUrl = 'https://api.deepseek.com/v1';

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

  async generateQuiz(bookContent: string) {
    const response = await axios.post(`${this.apiUrl}/quiz`, {
      content: bookContent
    }, {
      headers: { Authorization: `Bearer ${this.apiKey}` }
    });
    return response.data.questions;
  }
}
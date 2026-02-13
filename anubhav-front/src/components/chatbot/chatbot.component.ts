
import { Component, ChangeDetectionStrategy, signal, output, OnInit, ElementRef, viewChild, afterNextRender } from '@angular/core';
import { GoogleGenAI, Chat } from '@google/genai';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatbotComponent implements OnInit {
  close = output<void>();
  chatHistory = signal<ChatMessage[]>([]);
  userInput = signal('');
  isLoading = signal(false);

  private ai!: GoogleGenAI;
  private chat!: Chat;
  
  private readonly chatContainerEl = viewChild<ElementRef<HTMLDivElement>>('chatContainer');

  constructor() {
    afterNextRender(() => {
        this.scrollToBottom();
    });
  }

  ngOnInit(): void {
    // Per instructions, API_KEY is assumed to be available in the execution environment.
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    this.chat = this.ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are a friendly and helpful support assistant for a fantasy MMORPG game called "XAE". 
        Your goal is to answer player questions about gameplay, account issues, and technical problems. 
        Keep your answers concise, clear, and easy to understand for a general gaming audience.`,
      },
    });
    this.showInitialGreeting();
  }

  private getFormattedTimestamp(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private showInitialGreeting(): void {
    const timestamp = this.getFormattedTimestamp();
    this.chatHistory.set([{ 
      role: 'model', 
      text: 'Greetings, adventurer! I am the XAE Support Assistant. How can I help you forge your path today?', 
      timestamp
    }]);
    this.scrollToBottom();
  }

  async sendMessage(): Promise<void> {
    const message = this.userInput().trim();
    if (!message || this.isLoading()) return;

    const userTimestamp = this.getFormattedTimestamp();
    this.chatHistory.update(history => [...history, { role: 'user', text: message, timestamp: userTimestamp }]);
    this.userInput.set('');
    this.isLoading.set(true);
    this.scrollToBottom();

    try {
      const response = await this.chat.sendMessage({ message });
      const modelTimestamp = this.getFormattedTimestamp();
      this.chatHistory.update(history => [...history, { role: 'model', text: response.text, timestamp: modelTimestamp }]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorTimestamp = this.getFormattedTimestamp();
      this.chatHistory.update(history => [...history, { role: 'model', text: 'Sorry, I couldn\'t process that. Please try again.', timestamp: errorTimestamp }]);
    } finally {
      this.isLoading.set(false);
      this.scrollToBottom();
    }
  }
  
  private scrollToBottom(): void {
    const el = this.chatContainerEl()?.nativeElement;
    if (el) {
        setTimeout(() => el.scrollTop = el.scrollHeight, 10);
    }
  }
}

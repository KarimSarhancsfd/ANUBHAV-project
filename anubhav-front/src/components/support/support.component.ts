import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { ChatbotComponent } from '../chatbot/chatbot.component';
import { TranslationService } from '../../services/translation.service';
import { RevealOnScrollDirective } from '../../directives/reveal-on-scroll.directive';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ChatbotComponent, RevealOnScrollDirective],
})
export class SupportComponent {
  translationService = inject(TranslationService);
  searchQuery = signal('');
  
  supportCategories = [
    {
      titleKey: 'support.cat.account.title',
      descriptionKey: 'support.cat.account.desc',
      icon: 'shield'
    },
    {
      titleKey: 'support.cat.billing.title',
      descriptionKey: 'support.cat.billing.desc',
      icon: 'card'
    },
    {
      titleKey: 'support.cat.tech.title',
      descriptionKey: 'support.cat.tech.desc',
      icon: 'wrench'
    },
    {
      titleKey: 'support.cat.gameplay.title',
      descriptionKey: 'support.cat.gameplay.desc',
      icon: 'game'
    }
  ];

  faqs = [
    {
      questionKey: 'support.faq1.question',
      answerKey: 'support.faq1.answer'
    },
    {
      questionKey: 'support.faq2.question',
      answerKey: 'support.faq2.answer'
    },
    {
      questionKey: 'support.faq3.question',
      answerKey: 'support.faq3.answer'
    },
    {
      questionKey: 'support.faq4.question',
      answerKey: 'support.faq4.answer'
    }
  ];

  openIndex = signal<number | null>(0);
  isChatbotOpen = signal(false);

  toggleFaq(index: number) {
    this.openIndex.update(currentIndex => (currentIndex === index ? null : index));
  }

  toggleChatbot() {
    this.isChatbotOpen.update(value => !value);
  }

  performSearch(): void {
    const query = this.searchQuery().trim();
    if (!query) return;
    console.log('Searching for:', query);
    alert(`Search functionality for "${query}" is coming soon!`);
    // In a real app, you would trigger a search service call.
  }

  browseCategory(category: { titleKey: string }): void {
    const categoryName = this.translationService.translate(category.titleKey);
    console.log('Browsing category:', categoryName);
    alert(`The "${categoryName}" support section is coming soon!`);
  }

  submitTicket(): void {
    console.log('User wants to submit a ticket.');
    alert('The support ticket system is coming soon! For now, please use the AI Assistant.');
  }
}

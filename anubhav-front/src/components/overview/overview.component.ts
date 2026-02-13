import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { RevealOnScrollDirective } from '../../directives/reveal-on-scroll.directive';
import { NewsCardsComponent } from '../news-cards/news-cards.component';

interface OverviewSection {
  titleKey: string;
  textKey: string;
  image: string;
  alt: string;
}

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealOnScrollDirective, NewsCardsComponent],
})
export class OverviewComponent implements OnInit {
  translationService = inject(TranslationService);
  isLoading = signal(true);
  overviewContent = signal<OverviewSection[]>([]);

  private mockContent: OverviewSection[] = [
    {
      titleKey: 'overview.worldTitle',
      textKey: 'overview.worldText',
      image: 'https://picsum.photos/seed/xaeworld/800/600',
      alt: 'A vast, dynamic world'
    },
    {
      titleKey: 'overview.classTitle',
      textKey: 'overview.classText',
      image: 'https://picsum.photos/seed/xaeclass/800/600',
      alt: 'Diverse character classes'
    },
    {
      titleKey: 'overview.adventureTitle',
      textKey: 'overview.adventureText',
      image: 'https://picsum.photos/seed/xaeadventure/800/600',
      alt: 'Epic boss battles'
    }
  ];

  ngOnInit(): void {
    this.loadContent();
  }

  loadContent(): void {
    this.isLoading.set(true);
    // Simulate API call
    setTimeout(() => {
      this.overviewContent.set(this.mockContent);
      this.isLoading.set(false);
    }, 1500); // Simulate a 1.5 second delay
  }
}

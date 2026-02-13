import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface NewsCard {
  id: number;
  image: string;
  title: string;
  text: string;
  link: string;
  lastUpdated: string;
}

@Component({
  selector: 'app-news-cards',
  templateUrl: './news-cards.component.html',
  styleUrls: ['./news-cards.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class NewsCardsComponent {
  newsCards = signal<NewsCard[]>([
    {
      id: 1,
      image: 'https://i.imgur.com/wLMJQPH.png',
      title: 'Canon Unveils New Lens',
      text: 'Canon will have a full slate of new and updated products to show attendees at this year\'s NAB Show. The company has announced its new Compact-Servo 70-200mm telephoto zoom lens',
      link: '#',
      lastUpdated: 'Last updated 3 mins ago'
    },
    {
      id: 2,
      image: 'https://picsum.photos/seed/aboutus/800/600',
      title: 'Sennheiser HD 598 Tech Specs',
      text: 'The brown Sennheiser HD 598 audiophile headphones have excellent, detailed hi-fi sound and a stylish design. They are comfortable to wear and offer versatility as well. These accessories feature a multi-dimensional soundstage',
      link: '#',
      lastUpdated: 'Last updated 3 mins ago'
    },
    {
      id: 3,
      image: 'https://i.imgur.com/n6b2rib.png',
      title: 'North Sea Wind Power Hub',
      text: 'The harnessing of energy has never been without projects of monolithic scale. From the Hoover Dam to the Three Gorges—the world\'s largest power station—engineers the world over have recognised that with size comes advantages',
      link: '#',
      lastUpdated: 'Last updated 3 mins ago'
    },
    {
      id: 4,
      image: 'https://i.imgur.com/ssMsuUO.png',
      title: 'Apple MacBook Retina displays',
      text: 'In 2015 we reported on an issue with MacBook Retina displays that were seeing problems with the anti-reflective coating wearing off, which came to be known as \'Staingate.\'',
      link: '#',
      lastUpdated: 'Last updated 3 mins ago'
    },
    {
      id: 5,
      image: 'https://i.imgur.com/yAFDnZ1.png',
      title: 'Intel Dismisses 7700k Problems',
      text: 'Modern processors can run at temperatures ranging from 25 to 90 degrees, depending on configuration, cooling and workload. That said, when a CPU takes on a heavy load, that increase is gradual',
      link: '#',
      lastUpdated: 'Last updated 3 mins ago'
    },
    {
      id: 6,
      image: 'https://i.imgur.com/5rgwfW6.png',
      title: 'T3 Agenda: Beats By Dre',
      text: 'In the latest edition of the T3 Agenda, we prepare to box our ears with Beats By Dre\'s Anthony Joshua headphones, detail the pre-order incentives and special editions of Call of Duty WW2',
      link: '#',
      lastUpdated: 'Last updated 3 mins ago'
    }
  ]);

  hoveredCardId = signal<number | null>(null);

  onCardMouseEnter(cardId: number): void {
    this.hoveredCardId.set(cardId);
  }

  onCardMouseLeave(): void {
    this.hoveredCardId.set(null);
  }
}

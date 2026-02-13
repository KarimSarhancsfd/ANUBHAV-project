import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { RevealOnScrollDirective } from '../../directives/reveal-on-scroll.directive';

@Component({
  selector: 'app-campaign-grounds',
  templateUrl: './campaign-grounds.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealOnScrollDirective],
})
export class CampaignGroundsComponent {
  translationService = inject(TranslationService);
  
  galleryItems = [
    { image: 'https://picsum.photos/seed/gallery1/600/400', titleKey: 'campaign.gallery.item1.title', descriptionKey: 'campaign.gallery.item1.desc' },
    { image: 'https://picsum.photos/seed/gallery2/600/400', titleKey: 'campaign.gallery.item2.title', descriptionKey: 'campaign.gallery.item2.desc' },
    { image: 'https://picsum.photos/seed/gallery3/600/400', titleKey: 'campaign.gallery.item3.title', descriptionKey: 'campaign.gallery.item3.desc' },
    { image: 'https://picsum.photos/seed/gallery4/600/400', titleKey: 'campaign.gallery.item4.title', descriptionKey: 'campaign.gallery.item4.desc' },
    { image: 'https://picsum.photos/seed/gallery5/600/400', titleKey: 'campaign.gallery.item5.title', descriptionKey: 'campaign.gallery.item5.desc' },
    { image: 'https://picsum.photos/seed/gallery6/600/400', titleKey: 'campaign.gallery.item6.title', descriptionKey: 'campaign.gallery.item6.desc' },
  ];

  viewImage(item: { titleKey: string }): void {
    // In a real app, this would open a lightbox or modal with the full image.
    console.log('Viewing image:', this.translationService.translate(item.titleKey));
    alert(`Image viewer for "${this.translationService.translate(item.titleKey)}" is coming soon!`);
  }
}

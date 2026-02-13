import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { RevealOnScrollDirective } from '../../directives/reveal-on-scroll.directive';

@Component({
  selector: 'app-community',
  templateUrl: './community.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealOnScrollDirective],
})
export class CommunityComponent {
  translationService = inject(TranslationService);
  
  communitySections = [
    { titleKey: 'community.forums.title', descriptionKey: 'community.forums.desc', icon: 'chat' },
    { titleKey: 'community.tournaments.title', descriptionKey: 'community.tournaments.desc', icon: 'trophy' },
    { titleKey: 'community.creators.title', descriptionKey: 'community.creators.desc', icon: 'video' },
    { titleKey: 'community.knowledge.title', descriptionKey: 'community.knowledge.desc', icon: 'book' },
  ];

  navigateTo(section: { titleKey: string }): void {
    // In a real app, this would route to the respective community page.
    const sectionName = this.translationService.translate(section.titleKey);
    console.log('Navigating to:', sectionName);
    alert(`The "${sectionName}" section is coming soon!`);
  }
}

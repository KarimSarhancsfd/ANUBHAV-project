import { Component, ChangeDetectionStrategy, inject, signal, OnInit, computed } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { RevealOnScrollDirective } from '../../directives/reveal-on-scroll.directive';

interface Announcement {
  titleKey: string;
  category: 'Updates' | 'Notices' | 'Events' | 'GMNotes';
  date: string;
  snippetKey: string;
}

type CategoryFilter = 'All' | 'Notices' | 'Updates' | 'Events' | 'GMNotes';

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealOnScrollDirective],
})
export class AnnouncementsComponent implements OnInit {
  translationService = inject(TranslationService);
  isLoading = signal(true);
  announcements = signal<Announcement[]>([]);
  selectedCategory = signal<CategoryFilter>('All');

  readonly sections: { name: CategoryFilter; nameKey: string }[] = [
    { name: 'All', nameKey: 'announcements.tabs.all' },
    { name: 'Notices', nameKey: 'announcements.tabs.notices' },
    { name: 'Updates', nameKey: 'announcements.tabs.updates' },
    { name: 'Events', nameKey: 'announcements.tabs.events' },
    { name: 'GMNotes', nameKey: 'announcements.tabs.gmNotes' },
  ];

  filteredAnnouncements = computed(() => {
    const category = this.selectedCategory();
    if (category === 'All') {
      return this.announcements();
    }
    return this.announcements().filter(ann => ann.category === category);
  });

  private mockAnnouncements: Announcement[] = [
    { titleKey: 'announcements.post1.title', category: 'Updates', date: 'Oct 26, 2023', snippetKey: 'announcements.post1.snippet' },
    { titleKey: 'announcements.post2.title', category: 'Notices', date: 'Oct 25, 2023', snippetKey: 'announcements.post2.snippet' },
    { titleKey: 'announcements.post3.title', category: 'GMNotes', date: 'Oct 22, 2023', snippetKey: 'announcements.post3.snippet' },
    { titleKey: 'announcements.post4.title', category: 'Events', date: 'Oct 20, 2023', snippetKey: 'announcements.post4.snippet' },
    { titleKey: 'announcements.post5.title', category: 'Updates', date: 'Oct 18, 2023', snippetKey: 'announcements.post5.snippet' },
  ];

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  loadAnnouncements(): void {
    this.isLoading.set(true);
    // Simulate API call
    setTimeout(() => {
      this.announcements.set(this.mockAnnouncements);
      this.isLoading.set(false);
    }, 1500); // Simulate a 1.5 second delay
  }

  selectCategory(category: CategoryFilter): void {
    this.selectedCategory.set(category);
  }

  readMore(announcement: Announcement): void {
    // In a real app, this would navigate to the full article.
    // For now, it will just log to the console.
    console.log('Read more:', this.translationService.translate(announcement.titleKey));
    alert(`Feature "Read More" for "${this.translationService.translate(announcement.titleKey)}" is coming soon!`);
  }
}

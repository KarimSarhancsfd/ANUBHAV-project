import { Component, ChangeDetectionStrategy, signal, inject, OnInit, OnDestroy, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslationService, Language } from '../../services/translation.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  host: {
    '(window:scroll)': 'onScroll()',
    '[class.scrolled]': 'isScrolled()'
  },
  animations: [
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-8px) scale(0.98)' }),
        query('.lang-item', [
          style({ opacity: 0, transform: 'translateX(-6px)' })
        ], { optional: true }),
        animate('260ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
        query('.lang-item', [
          stagger('35ms', [
            animate('200ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateX(0)' }))
          ])
        ], { optional: true })
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-6px) scale(0.985)' }))
      ])
    ]),
    trigger('mobileListAnimation', [
      transition(':enter', [
        query('.mobile-lang-item', [
          style({ opacity: 0, transform: 'translateY(-10px)' })
        ], { optional: true }),
        query('.mobile-lang-item', [
          stagger('50ms', [
            animate('300ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMenuOpen = signal(false);
  isLangDropdownOpen = signal(false);
  isScrolled = signal(false);
  isMusicPlaying = signal(false);
  translationService = inject(TranslationService);
  
  private audio: HTMLAudioElement | null = null;

  languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'ja', label: '日本語' },
    { code: 'ar', label: 'العربية' },
    { code: 'hi', label: 'हिन्दी' },
  ];

  navLinks = [
    { path: '/dashboard', labelKey: 'dashboard.title' },
    { path: '/announcements', labelKey: 'nav.announcements' },
    { path: '/overview', labelKey: 'nav.overview' },
    { path: '/campaign-grounds', labelKey: 'nav.campaign' },
    { path: '/community', labelKey: 'nav.community' },
    { path: '/support', labelKey: 'nav.support' },
  ];

  currentLanguageLabel = computed(() => 
    this.languages.find(l => l.code === this.translationService.currentLang())?.label ?? this.languages[0].label
  );

  ngOnInit(): void {
    if (typeof Audio !== 'undefined') {
      // NOTE: This is a placeholder for the actual background music file.
      // In a real application, this would point to a licensed audio track in the assets folder.
      this.audio = new Audio('https://storage.googleapis.com/applet-assets/epic-cinematic-adventure.mp3');
      this.audio.loop = true;
      this.audio.volume = 0.15; // Start with a low, ambient volume
    }
  }

  ngOnDestroy(): void {
    this.audio?.pause();
    this.audio = null;
  }

  onScroll(): void {
    if (typeof window !== 'undefined') {
      this.isScrolled.set(window.scrollY > 50);
    }
  }

  toggleMenu() {
    this.isMenuOpen.update(value => !value);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
    this.isLangDropdownOpen.set(false);
  }

  toggleLangDropdown() {
    this.isLangDropdownOpen.update(value => !value);
  }

  changeLanguage(lang: Language) {
    this.translationService.setLanguage(lang);
    this.isLangDropdownOpen.set(false);
  }

  toggleMusic() {
    if (!this.audio) return;

    this.isMusicPlaying.update(value => {
      const isPlaying = !value;
      if (isPlaying) {
        this.audio?.play().catch(e => console.error("Audio play failed:", e));
      } else {
        this.audio?.pause();
      }
      return isPlaying;
    });
  }
}
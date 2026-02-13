import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { trigger, transition, query, style, animate } from '@angular/animations';
import { RouterLink } from '@angular/router';

interface Character {
  id: string;
  nameKey: string;
  descKey: string;
  mainImage: string;
  thumbnailImage: string;
}

@Component({
  selector: 'app-character-showcase',
  templateUrl: './character-showcase.component.html',
  styleUrls: ['./character-showcase.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  animations: [
    trigger('fadeAnimation', [
      transition('* => *', [
        style({ opacity: 0, transform: 'scale(0.98)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
    ]),
     trigger('textAnimation', [
      transition('* => *', [
        query(':self', [
          style({ opacity: 0, transform: 'translateY(15px)' }),
          animate('400ms 100ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
        ], { optional: true })
      ])
    ])
  ]
})
export class CharacterShowcaseComponent implements OnInit {
  translationService = inject(TranslationService);
  
  selectedCharacterId = signal<string>('');
  
  characters = signal<Character[]>([
    { id: 'sentinel', nameKey: 'classes.sentinel.name', descKey: 'classes.sentinel.desc.short', mainImage: 'https://picsum.photos/seed/xaesinel-portrait/800/1200', thumbnailImage: 'https://picsum.photos/seed/xaesinel-thumb/150/150' },
    { id: 'reaper', nameKey: 'classes.reaper.name', descKey: 'classes.reaper.desc.short', mainImage: 'https://picsum.photos/seed/xaereaper-portrait/800/1200', thumbnailImage: 'https://picsum.photos/seed/xaereaper-thumb/150/150' },
    { id: 'arcanist', nameKey: 'classes.arcanist.name', descKey: 'classes.arcanist.desc.short', mainImage: 'https://picsum.photos/seed/xaearcanist-portrait/800/1200', thumbnailImage: 'https://picsum.photos/seed/xaearcanist-thumb/150/150' },
    { id: 'warden', nameKey: 'classes.warden.name', descKey: 'classes.warden.desc.short', mainImage: 'https://picsum.photos/seed/xaewarden-portrait/800/1200', thumbnailImage: 'https://picsum.photos/seed/xaewarden-thumb/150/150' },
    { id: 'bladedancer', nameKey: 'classes.bladedancer.name', descKey: 'classes.bladedancer.desc.short', mainImage: 'https://picsum.photos/seed/xaeblade-portrait/800/1200', thumbnailImage: 'https://picsum.photos/seed/xaeblade-thumb/150/150' },
    { id: 'pyromancer', nameKey: 'classes.pyromancer.name', descKey: 'classes.pyromancer.desc.short', mainImage: 'https://picsum.photos/seed/xaepyro-portrait/800/1200', thumbnailImage: 'https://picsum.photos/seed/xaepyro-thumb/150/150' },
    { id: 'stormcaller', nameKey: 'classes.stormcaller.name', descKey: 'classes.stormcaller.desc.short', mainImage: 'https://picsum.photos/seed/xaestorm-portrait/800/1200', thumbnailImage: 'https://picsum.photos/seed/xaestorm-thumb/150/150' },
    { id: 'voidknight', nameKey: 'classes.voidknight.name', descKey: 'classes.voidknight.desc.short', mainImage: 'https://picsum.photos/seed/xaevoid-portrait/800/1200', thumbnailImage: 'https://picsum.photos/seed/xaevoid-thumb/150/150' },
    { id: 'gunslinger', nameKey: 'classes.gunslinger.name', descKey: 'classes.gunslinger.desc.short', mainImage: 'https://picsum.photos/seed/xaegun-portrait/800/1200', thumbnailImage: 'https://picsum.photos/seed/xaegun-thumb/150/150' },
    { id: 'chronomancer', nameKey: 'classes.chronomancer.name', descKey: 'classes.chronomancer.desc.short', mainImage: 'https://picsum.photos/seed/xaechrono-portrait/800/1200', thumbnailImage: 'https://picsum.photos/seed/xaechrono-thumb/150/150' },
    { id: 'spiritmaster', nameKey: 'classes.spiritmaster.name', descKey: 'classes.spiritmaster.desc.short', mainImage: 'https://picsum.photos/seed/xaespirit-portrait/800/1200', thumbnailImage: 'https://picsum.photos/seed/xaespirit-thumb/150/150' },
    { id: 'earthshaker', nameKey: 'classes.earthshaker.name', descKey: 'classes.earthshaker.desc.short', mainImage: 'https://picsum.photos/seed/xaeearth-portrait/800/1200', thumbnailImage: 'https://picsum.photos/seed/xaeearth-thumb/150/150' },
  ]);

  selectedCharacter = computed(() => this.characters().find(c => c.id === this.selectedCharacterId()));

  ngOnInit(): void {
    if (this.characters().length > 0) {
      this.selectedCharacterId.set(this.characters()[0].id);
    }
  }

  selectCharacter(id: string): void {
    this.selectedCharacterId.set(id);
  }

  learnMore(character: Character): void {
    const charName = this.translationService.translate(character.nameKey);
    console.log('Learn more about:', charName);
    alert(`A detailed page for the "${charName}" class is coming soon!`);
  }
}

import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { trigger, transition, query, stagger, style, animate } from '@angular/animations';
import { TranslationService } from '../../services/translation.service';

interface GameClass {
  id: string;
  nameKey: string;
  descKey: string;
  image: string; // Icon/card image
  portraitImage: string; // Full body image for detailed view
  pveRole: string;
  pvpRole: string;
}

@Component({
  selector: 'app-classes-system',
  templateUrl: './classes-system.component.html',
  styleUrls: ['./classes-system.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('staggeredAnimation', [
      transition('* => *', [
        // Query for the elements to animate, ensuring we target direct children for robustness.
        query(':scope > h3, :scope > p, :scope > div', [
          style({ opacity: 0, transform: 'translateY(15px)' })
        ], { optional: true }),
        query(':scope > h3, :scope > p, :scope > div', [
          stagger('100ms', [
            animate('0.6s cubic-bezier(0.165, 0.84, 0.44, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class ClassesSystemComponent implements OnInit {
  translationService = inject(TranslationService);
  selectedClass = signal<GameClass | null>(null);

  // A key to force re-animation on selection change
  animationKey = signal(0);

  classes: GameClass[] = [
    {
      id: 'sentinel',
      nameKey: 'classes.sentinel.name',
      descKey: 'classes.sentinel.desc',
      image: 'https://picsum.photos/seed/xaesinel/800/1000',
      portraitImage: 'https://picsum.photos/seed/xaesinel-portrait/800/1200',
      pveRole: 'Tank',
      pvpRole: 'Defender',
    },
    {
      id: 'reaper',
      nameKey: 'classes.reaper.name',
      descKey: 'classes.reaper.desc',
      image: 'https://picsum.photos/seed/xaereaper/800/1000',
      portraitImage: 'https://picsum.photos/seed/xaereaper-portrait/800/1200',
      pveRole: 'Melee DPS',
      pvpRole: 'Assassin',
    },
    {
      id: 'arcanist',
      nameKey: 'classes.arcanist.name',
      descKey: 'classes.arcanist.desc',
      image: 'https://picsum.photos/seed/xaearcanist/800/1000',
      portraitImage: 'https://picsum.photos/seed/xaearcanist-portrait/800/1200',
      pveRole: 'Ranged DPS',
      pvpRole: 'Nuker',
    },
    {
      id: 'warden',
      nameKey: 'classes.warden.name',
      descKey: 'classes.warden.desc',
      image: 'https://picsum.photos/seed/xaewarden/800/1000',
      portraitImage: 'https://picsum.photos/seed/xaewarden-portrait/800/1200',
      pveRole: 'Healer / Support',
      pvpRole: 'Control',
    },
  ];

  ngOnInit(): void {
    // Set the initial selected class
    if (this.classes.length > 0) {
      this.selectedClass.set(this.classes[0]);
    }
  }

  selectClass(classToSelect: GameClass): void {
    if (this.selectedClass()?.id !== classToSelect.id) {
      this.selectedClass.set(classToSelect);
      // Increment the key to trigger re-animation on the text elements
      this.animationKey.update(key => key + 1);
    }
  }
}
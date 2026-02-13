import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../services/translation.service';

import { ClassesSystemComponent } from '../classes-system/classes-system.component';
import { CombatExperienceComponent } from '../combat-experience/combat-experience.component';
import { OpenWorldComponent } from '../open-world/open-world.component';
import { MountsVehiclesComponent } from '../mounts-vehicles/mounts-vehicles.component';
import { PvpPveComponent } from '../pvp-pve/pvp-pve.component';
import { LegendStatusComponent } from '../legend-status/legend-status.component';
import { RevealOnScrollDirective } from '../../directives/reveal-on-scroll.directive';
import { CharacterShowcaseComponent } from '../character-showcase/character-showcase.component';
import { CinematicIntroComponent } from '../cinematic-intro/cinematic-intro.component';
import { CinematicMediaComponent } from '../cinematic-media/cinematic-media.component';


@Component({
  selector: 'app-home',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    CinematicIntroComponent,

    ClassesSystemComponent,
    CombatExperienceComponent,
    OpenWorldComponent,
    MountsVehiclesComponent,
    PvpPveComponent,
    CharacterShowcaseComponent,
    CinematicMediaComponent,
    LegendStatusComponent,
    RevealOnScrollDirective,
  ],
  host: {
    '(window:scroll)': 'onScroll()',
  },
})
export class HomeComponent {
  scrollY = signal(0);
  translationService = inject(TranslationService);

  platformIcons = [
    { name: 'Steam', svgPath: 'M11.97 2c-5.1 0-9.25 3.9-9.25 8.75s4.15 8.75 9.25 8.75a9.3 9.3 0 006.3-2.3l-2.1-2.2c-1.2 1-2.9 1.7-4.4 1.7-3.3 0-6-2.5-6-5.7s2.7-5.7 6-5.7c2.1 0 3.9.9 5 2.4V7.5h-3v-2h5.1v7.6c-1.4 2.3-3.9 3.9-6.8 3.9z' },
    { name: 'Xbox', svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.14 15.34c-2.43.6-4.33-.21-4.33-2.04 0-1.27.9-2.04 2.38-2.38 1.1-.28 2.44-.43 4.2-.62-2.34-1.12-2.7-2.3-2.7-3.4 0-1.45 1.1-2.5 2.82-2.5 1.75 0 2.5.96 2.5 2.14 0 1.25-.68 2.1-2.2 2.5-1.1.28-2.6.43-4.57.62 2.25 1 2.8 2.2 2.8 3.54 0 1.6-1.1 2.6-3 2.6z' },
    { name: 'Google Play Games', svgPath: 'M6.51 5.07L12 2l5.49 3.07-5.49 3.07L6.51 5.07zM2 12l5.49-3.07v6.14L2 12zm10.98 3.07L12 15.93l-1.02-.57-4.47-2.49v-1.14l5.49-3.07 5.49 3.07v6.14L12.98 15.07zM17.51 8.93L12 12l5.51 3.07v-6.14z' }
  ];
  
  backgroundParallaxTransform = computed(() => {
    const scroll = this.scrollY();
    // Start slightly more zoomed in and move it down faster (so it appears to move slower)
    const scale = 1.15 - (scroll * 0.0003);
    const translateY = scroll * 0.6;
    return `scale(${Math.max(1, scale)}) translateY(${translateY}px)`;
  });

  foregroundParallaxTransform = computed(() => {
    const scroll = this.scrollY();
    // Moves slower than the background, creating the depth effect
    const translateY = scroll * 0.2;
    const scale = 1 - (scroll * 0.00015);
    return `scale(${Math.max(0.95, scale)}) translateY(${translateY}px)`;
  });

  onScroll(): void {
    if (typeof window !== 'undefined') {
      this.scrollY.set(window.scrollY);
    }
  }
}
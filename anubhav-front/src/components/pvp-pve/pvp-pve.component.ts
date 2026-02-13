import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-pvp-pve',
  templateUrl: './pvp-pve.component.html',
  styleUrls: ['./pvp-pve.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PvpPveComponent {
  translationService = inject(TranslationService);

  exploreMode(mode: 'PVE' | 'PVP'): void {
    console.log('Exploring mode:', mode);
    alert(`More details about the ${mode} game modes are coming soon!`);
  }
}

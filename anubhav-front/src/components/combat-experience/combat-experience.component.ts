import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { WeaponShowcaseComponent } from '../weapon-showcase/weapon-showcase.component';

@Component({
  selector: 'app-combat-experience',
  templateUrl: './combat-experience.component.html',
  styleUrls: ['./combat-experience.component.css'],
  imports: [WeaponShowcaseComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CombatExperienceComponent {
  translationService = inject(TranslationService);
}

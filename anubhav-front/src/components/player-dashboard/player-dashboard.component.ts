import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../services/player.service';
import { TranslationService } from '../../services/translation.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-player-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-dashboard.component.html',
  styleUrls: ['./player-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class PlayerDashboardComponent {
  playerService = inject(PlayerService);
  translationService = inject(TranslationService);
  
  simulateXP() {
    this.playerService.addXP(200);
  }
}

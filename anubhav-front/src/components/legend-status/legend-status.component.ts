import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-legend-status',
  templateUrl: './legend-status.component.html',
  styleUrls: ['./legend-status.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class LegendStatusComponent {
  translationService = inject(TranslationService);
}

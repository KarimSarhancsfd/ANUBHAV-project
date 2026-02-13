import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: []
})
export class FooterComponent {
  currentYear: number;
  translationService = inject(TranslationService);

  constructor() {
    this.currentYear = new Date().getFullYear();
  }
}

import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadComponent {
  translationService = inject(TranslationService);
  launchState = signal<'idle' | 'connecting' | 'connected'>('idle');

  startDownload(): void {
    console.log('Starting game client download...');
    alert('The game client download will begin shortly! (This is a simulation)');
  }

  simulateLaunch(): void {
    this.launchState.set('connecting');
    
    setTimeout(() => {
      this.launchState.set('connected');
      
      setTimeout(() => {
        this.launchState.set('idle');
        alert('Game application launched successfully!');
      }, 2000);
    }, 2500);
  }
}

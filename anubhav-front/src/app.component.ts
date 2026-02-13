


import { Component, ChangeDetectionStrategy, signal, OnInit, inject, Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoadingScreenComponent } from './components/loading-screen/loading-screen.component';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, LoadingScreenComponent],
})
export class AppComponent implements OnInit {
  showLoader = signal(true);
  isFadingOut = signal(false);
  private renderer = inject(Renderer2);
  private document: Document = inject(DOCUMENT);

  private readonly LOADING_DURATION = 2500;
  private readonly FADE_DURATION = 700;

  constructor() {
    this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
  }

  ngOnInit(): void {
    // Simulate asset loading
    setTimeout(() => {
      this.isFadingOut.set(true);
      
      setTimeout(() => {
        this.showLoader.set(false);
        this.renderer.removeStyle(this.document.body, 'overflow');
      }, this.FADE_DURATION);
    }, this.LOADING_DURATION);
  }
}
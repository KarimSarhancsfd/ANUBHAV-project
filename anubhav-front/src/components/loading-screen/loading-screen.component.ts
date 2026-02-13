import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-loading-screen',
  templateUrl: './loading-screen.component.html',
  styleUrls: ['./loading-screen.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingScreenComponent {}
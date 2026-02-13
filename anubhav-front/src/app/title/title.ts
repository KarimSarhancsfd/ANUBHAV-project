import { Component, input } from '@angular/core';

@Component({
  selector: 'app-title',
  imports: [],
  templateUrl: './title.html',
  styleUrl: './title.css',
})
export class Title {
  // title = signal('crash-project');
  // title = input.required<string>();
  title = 'crash-project';
}

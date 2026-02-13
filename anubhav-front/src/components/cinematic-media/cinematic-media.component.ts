import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cinematic-media',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cinematic-media.component.html',
  styleUrls: ['./cinematic-media.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CinematicMediaComponent {
  // Placeholder data for the media showcase
  mediaItems = signal([
    {
      id: 1,
      type: 'image',
      src: 'assets/images/cinematic-media/media1.png',
      title: 'The Golden Sands',
      description: 'Ancient ruins buried beneath the eternal dunes.',
    },
    {
      id: 2,
      type: 'image',
      src: 'assets/images/cinematic-media/media2.png',
      title: 'Legendary Artifact',
      description: 'Power forged in the fires of the sun.',
    },
    {
      id: 3,
      type: 'video', // Placeholder for video styling
      src: 'assets/videos/placeholder.mp4', // This might not exist, but we style against it
      poster: 'https://picsum.photos/seed/sandlegend/800/450',
      title: 'Combat Deep Dive',
      description: 'Master the arts of the desert warriors.',
    }
  ]);

  hoveredId = signal<number | null>(null);

  onHover(id: number | null) {
    this.hoveredId.set(id);
  }
}

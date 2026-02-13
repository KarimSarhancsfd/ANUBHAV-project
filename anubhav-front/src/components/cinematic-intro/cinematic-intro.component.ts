import { Component, ChangeDetectionStrategy, inject, ElementRef, viewChild, afterNextRender, OnDestroy } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { CinematicFrameService } from '../../assets/cinematic-frame.service';

import { CinematicRevealDirective } from '../../directives/cinematic-reveal.directive';

@Component({
  selector: 'app-cinematic-intro',
  templateUrl: './cinematic-intro.component.html',
  styleUrls: ['./cinematic-intro.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CinematicFrameService],
  standalone: true,
  imports: [CinematicRevealDirective],
  host: {
    '(window:scroll)': 'handleScroll()',
    '(window:resize)': 'handleResize()'
  }
})
export class CinematicIntroComponent implements OnDestroy {
  translationService = inject(TranslationService);
  frameProvider = inject(CinematicFrameService);

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('scrollCanvas');
  private readonly containerRef = viewChild.required<ElementRef<HTMLElement>>('cinematicContainer');

  private frames: HTMLImageElement[] = [];
  private frameCount = 0;
  private context: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;
  private currentFrame = 0;
  private targetFrame = 0;

  constructor() {
    afterNextRender(() => this.initCanvasAnimation());
  }

  private async initCanvasAnimation(): Promise<void> {
    const canvas = this.canvasRef().nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2D context from canvas');
      return;
    }
    this.context = ctx;

    try {
      this.frames = await this.preloadFrames();
      this.frameCount = this.frames.length;
      
      // Use Renderer2 for listener or HostListener for better Angular integration
      // Avoiding memory leaks and ensuring cleanup
      this.resizeCanvas(); // Initial size
      this.drawFrame(); // Initial draw
      
      this.animate(); // Start the animation loop
    } catch (error) {
      console.error('Failed to preload frames:', error);
    }
  }

  private preloadFrames(): Promise<HTMLImageElement[]> {
    const frameUrls = this.frameProvider.getFrames();
    const promises = frameUrls.map(src => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(`Failed to load frame: ${src}`);
        img.src = src;
      });
    });
    return Promise.all(promises);
  }

  handleScroll = (): void => {
    if (!this.containerRef) return;
    const container = this.containerRef().nativeElement;
    const { top, height } = container.getBoundingClientRect();
    const scrollableHeight = height - window.innerHeight;
    
    // Calculate progress from 0 to 1 as user scrolls through the sticky container
    let progress = -top / scrollableHeight;
    progress = Math.max(0, Math.min(1, progress));

    this.targetFrame = Math.floor(progress * (this.frameCount - 1));
  };

  private animate = (): void => {
    if (!this.context) return;

    // Smoothly interpolate to the target frame for cinematic effect
    const lerpFactor = 0.08;
    const prevFrame = Math.round(this.currentFrame);
    this.currentFrame += (this.targetFrame - this.currentFrame) * lerpFactor;
    const nextFrame = Math.round(this.currentFrame);
    
    // Only redraw if the integer frame has changed to save CPU/GPU
    if (prevFrame !== nextFrame) {
        this.drawFrame();
    }
    
    this.animationFrameId = requestAnimationFrame(this.animate);
  }
  
  private drawFrame(): void {
    if (!this.context || this.frames.length === 0) return;

    const frameIndex = Math.round(this.currentFrame);
    const image = this.frames[frameIndex];
    if (!image) return;

    const canvas = this.context.canvas;
    const canvasRatio = canvas.width / canvas.height;
    const imageRatio = image.naturalWidth / image.naturalHeight;

    let drawWidth = canvas.width;
    let drawHeight = canvas.height;
    let offsetX = 0;
    let offsetY = 0;

    // Implement "object-fit: cover" logic
    if (imageRatio > canvasRatio) {
      drawHeight = canvas.width / imageRatio;
      offsetY = (canvas.height - drawHeight) / 2;
    } else {
      drawWidth = canvas.height * imageRatio;
      offsetX = (canvas.width - drawWidth) / 2;
    }

    this.context.clearRect(0, 0, canvas.width, canvas.height);
    this.context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
  }

  private resizeCanvas(): void {
    if (!this.context) return;
    const canvas = this.context.canvas;
    const parent = canvas.parentElement;
    if (parent) {
      if (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    }
  }

  handleResize(): void {
    this.resizeCanvas();
    this.drawFrame();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
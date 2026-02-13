import { Component, ChangeDetectionStrategy, inject, ElementRef, signal, viewChild, afterNextRender, OnDestroy } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { FrameProviderService } from '../../assets/frame-provider.service';

@Component({
  selector: 'app-open-world',
  templateUrl: './open-world.component.html',
  styleUrls: ['./open-world.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FrameProviderService],
})
export class OpenWorldComponent implements OnDestroy {
  translationService = inject(TranslationService);
  frameProvider = inject(FrameProviderService);

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('scrollCanvas');
  private readonly containerRef = viewChild.required<ElementRef<HTMLElement>>('openWorldContainer');

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
      window.addEventListener('scroll', this.handleScroll);
      this.resizeCanvas(); // Initial draw
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

  private handleScroll = (): void => {
    const container = this.containerRef().nativeElement;
    const { top, height } = container.getBoundingClientRect();
    const scrollableHeight = height - window.innerHeight;
    
    // Calculate progress from 0 to 1
    let progress = Math.abs(top) / scrollableHeight;
    progress = Math.max(0, Math.min(1, progress));

    this.targetFrame = Math.floor(progress * (this.frameCount - 1));
  };

  private animate = (): void => {
    if (!this.context) return;

    // Smoothly interpolate to the target frame
    const lerpFactor = 0.08;
    this.currentFrame += (this.targetFrame - this.currentFrame) * lerpFactor;
    
    this.drawFrame();
    
    this.animationFrameId = requestAnimationFrame(this.animate);
  }
  
  private drawFrame(): void {
    if (!this.context || this.frames.length === 0) return;

    const frameIndex = Math.round(this.currentFrame);
    const image = this.frames[frameIndex];
    if (!image) return;

    this.resizeCanvas(); // Ensure canvas is correctly sized
    
    const canvas = this.context.canvas;
    const canvasRatio = canvas.width / canvas.height;
    const imageRatio = image.naturalWidth / image.naturalHeight;

    let drawWidth = canvas.width;
    let drawHeight = canvas.height;
    let offsetX = 0;
    let offsetY = 0;

    // "object-fit: cover" logic
    if (imageRatio > canvasRatio) {
      drawWidth = canvas.height * imageRatio;
      offsetX = (canvas.width - drawWidth) / 2;
    } else {
      drawHeight = canvas.width / imageRatio;
      offsetY = (canvas.height - drawHeight) / 2;
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

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.handleScroll);
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}

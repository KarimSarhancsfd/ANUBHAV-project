import { Injectable } from '@angular/core';

@Injectable()
export class FrameProviderService {
  private readonly frameCount = 90;
  private readonly frames: string[] = [];

  constructor() {
    this.generateFrameUrls();
  }

  private generateFrameUrls(): void {
    // In a real application, these would be paths to actual frame assets.
    // Here, we simulate this by generating unique URLs from a placeholder service.
    // The seeds are chosen to create a dark, abstract sequence.
    for (let i = 1; i <= this.frameCount; i++) {
      // We use a non-linear mapping to create a more dynamic change between "frames"
      const seedNumber = 1000 + i * i; 
      this.frames.push(`https://picsum.photos/seed/reaper${seedNumber}/1280/720?grayscale&blur=2`);
    }
  }

  getFrames(): string[] {
    return this.frames;
  }
}

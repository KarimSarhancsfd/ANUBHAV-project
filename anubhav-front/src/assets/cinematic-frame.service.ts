import { Injectable } from '@angular/core';

@Injectable()
export class CinematicFrameService {
  private readonly frameCount = 145;
  private readonly frames: string[] = [];

  constructor() {
    this.generateFrameUrls();
  }

  private generateFrameUrls(): void {
    // Load frames from the reaper-frames directory
    for (let i = 1; i <= this.frameCount; i++) {
      const frameNumber = String(i).padStart(3, '0');
      this.frames.push(`/assets/images/characters/reaper-frames/ezgif-frame-${frameNumber}.jpg`);
    }
  }

  getFrames(): string[] {
    return this.frames;
  }
}
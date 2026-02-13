# Reaper Frame Animation Assets

This directory contains the frame sequence images for the Reaper character animation.

## Location
Images are located at: `src/assets/images/characters/reaper-frames/`

## File Naming Convention

Images follow the ezgif-frame pattern:
- ezgif-frame-001.jpg
- ezgif-frame-002.jpg
- ezgif-frame-003.jpg
- ...
- ezgif-frame-145.jpg

## Configuration

The animation component is configured to:
- Look for images at: `/assets/images/characters/reaper-frames/`
- Frame count: Auto-detected (up to 145 frames)
- Target frame rate: 24 FPS
- Loop: Continuous

## Animation Behavior

- Animation starts when the section comes into view (Intersection Observer)
- Continues at 24 FPS when visible
- Supports scroll-based frame progression for enhanced UX
- Automatically pauses when section is not visible
- Preloads all available frames for smooth playback
- Auto-detects actual number of frames available

## Server Configuration

Assets are served through Angular's build configuration (angular.json) to ensure proper access at `/assets/` path.
import { Directive, ElementRef, Renderer2, AfterViewInit, OnDestroy, HostBinding, Input, inject } from '@angular/core';

@Directive({
  selector: '[appCinematicReveal]',
  standalone: true
})
export class CinematicRevealDirective implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private observer: IntersectionObserver | null = null;
  private scrollListener: (() => void) | null = null;
  
  @Input() revealDelay = 30; // ms between letters
  @Input() parallaxFactor = 0.05; // speed of parallax relative to scroll

  ngAfterViewInit() {
    this.prepareText();
    this.setupIntersectionObserver();
  }

  private prepareText() {
    const element = this.el.nativeElement;
    
    // We only want to split text nodes into spans, preserving existing HTML structure if any
    // For this specific use case, we assume the directive is placed on a container with text or simple elements
    // A recursive approach would be more robust, but for the cinematic intro, let's keep it focused.
    
    this.splitTextNodes(element);
    
    // Set initial state for all letters
    const letters = element.querySelectorAll('.cinematic-letter');
    letters.forEach((letter: HTMLElement, index: number) => {
      this.renderer.setStyle(letter, 'opacity', '0');
      this.renderer.setStyle(letter, 'transform', 'translateY(20px) scale(0.9)');
      this.renderer.setStyle(letter, 'display', 'inline-block');
      this.renderer.setStyle(letter, 'transition', `transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease-out`);
      
      // Prevent spacing issues for Arabic words or spaces
      if (letter.textContent === ' ') {
         this.renderer.setStyle(letter, 'width', '0.25em');
      } else if (this.isArabic(letter.textContent || '')) {
         this.renderer.setStyle(letter, 'margin-inline-end', '0.25em');
         this.renderer.setStyle(letter, 'white-space', 'nowrap');
      }
    });
  }

  private isArabic(text: string): boolean {
    const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicPattern.test(text);
  }

  private splitTextNodes(element: Node) {
    if (element.nodeType === Node.TEXT_NODE) {
      const text = element.textContent?.trim();
      if (!text) return;
      
      const fragment = document.createDocumentFragment();
      const isArabicText = this.isArabic(text);
      
      if (isArabicText) {
        // For Arabic, split by words to preserve shaping
        const words = text.split(/(\s+)/);
        words.forEach(word => {
          if (word.trim().length > 0) {
            const span = document.createElement('span');
            span.textContent = word;
            span.className = 'cinematic-letter';
            fragment.appendChild(span);
          } else if (word.length > 0) {
            // Preserve spaces as separate tokens
            const span = document.createElement('span');
            span.innerHTML = '&nbsp;';
            span.className = 'cinematic-letter';
            fragment.appendChild(span);
          }
        });
      } else {
        // For other languages, split by characters
        const chars = text.split('');
        chars.forEach(char => {
          const span = document.createElement('span');
          span.textContent = char;
          span.className = 'cinematic-letter';
          // Preserve spaces
          if (char === ' ') {
              span.innerHTML = '&nbsp;';
          }
          fragment.appendChild(span);
        });
      }
      
      element.parentNode?.replaceChild(fragment, element);
    } else {
      const children = Array.from(element.childNodes);
      children.forEach(child => this.splitTextNodes(child));
    }
  }

  private setupIntersectionObserver() {
    const options = {
      root: null,
      threshold: 0.2, // Trigger when 20% visible
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.triggerReveal();
          this.setupParallax();
          this.observer?.disconnect(); // Trigger only once
        }
      });
    }, options);

    this.observer.observe(this.el.nativeElement);
  }

  private triggerReveal() {
    const letters = this.el.nativeElement.querySelectorAll('.cinematic-letter');
    
    letters.forEach((letter: HTMLElement, index: number) => {
      setTimeout(() => {
        this.renderer.setStyle(letter, 'opacity', '1');
        this.renderer.setStyle(letter, 'transform', 'translateY(0) scale(1)');
        // Add subtle glow effect on reveal
        this.renderer.setStyle(letter, 'text-shadow', '0 0 10px rgba(192, 132, 252, 0.4)');
        
        // Remove text-shadow after animation for performance, or keep it for the "Legendary" look
        // Keeping it for the look as requested.
      }, index * this.revealDelay);
    });
  }

  private setupParallax() {
    // Simple parallax effect
    this.scrollListener = this.renderer.listen(window, 'scroll', () => {
      const rect = this.el.nativeElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate position relative to viewport
      const offset = (rect.top - viewportHeight / 2) * this.parallaxFactor;
      
      // Apply transform to the container, not individual letters (for performance)
      // Note: We need to respect the CSS transform applied by the reveal animation.
      // Since the letters have their own transform, we can translate the container.
      
      // However, the user asked for interaction with the frame engine. 
      // The frame engine itself sticks. The text should float slightly.
       this.renderer.setStyle(this.el.nativeElement, 'transform', `translateY(${offset}px)`);
    });
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.scrollListener) {
      this.scrollListener();
    }
  }
}

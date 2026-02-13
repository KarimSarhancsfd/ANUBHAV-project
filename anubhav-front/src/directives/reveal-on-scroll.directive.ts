import { Directive, ElementRef, afterNextRender, inject, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appRevealOnScroll]',
  standalone: true,
})
export class RevealOnScrollDirective {
  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);

  constructor() {
    afterNextRender(() => {
      const element = this.elementRef.nativeElement;
      
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.renderer.addClass(element, 'in-viewport');
              obs.unobserve(element);
            }
          });
        },
        { threshold: 0.15 } // Trigger when 15% of the element is visible
      );

      observer.observe(element);
    });
  }
}

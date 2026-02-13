import { Component, ChangeDetectionStrategy, inject, ElementRef, signal, viewChild, computed } from '@angular/core';
import { TranslationService } from '../../services/translation.service';

interface Mount {
  nameKey: string;
  image: string;
}

@Component({
  selector: 'app-mounts-vehicles',
  templateUrl: './mounts-vehicles.component.html',
  styleUrls: ['./mounts-vehicles.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MountsVehiclesComponent {
  translationService = inject(TranslationService);
  carousel = viewChild<ElementRef<HTMLDivElement>>('carousel');
  
  currentIndex = signal(0);
  
  mounts: Mount[] = [
    { nameKey: 'mounts.emberdrake.name', image: 'https://picsum.photos/seed/xaedrake/800/600' },
    { nameKey: 'mounts.sandstrider.name', image: 'https://picsum.photos/seed/xaestrider/800/600' },
    { nameKey: 'mounts.lunarix.name', image: 'https://picsum.photos/seed/xaelunarix/800/600' },
    { nameKey: 'mounts.ironclad.name', image: 'https://picsum.photos/seed/xaejuggernaut/800/600' },
  ];

  isAtStart = computed(() => this.currentIndex() === 0);
  isAtEnd = computed(() => this.currentIndex() === this.mounts.length - 1);

  private scrollDebounceTimer: any;

  onMouseMove(event: MouseEvent) {
    const card = event.currentTarget as HTMLElement;
    const { left, top, width, height } = card.getBoundingClientRect();
    const x = event.clientX - left - width / 2;
    const y = event.clientY - top - height / 2;

    const rotateX = (-y / height) * 15; // Max rotation 7.5 degrees
    const rotateY = (x / width) * 15; // Max rotation 7.5 degrees

    card.style.setProperty('--rotateX', `${rotateX}deg`);
    card.style.setProperty('--rotateY', `${rotateY}deg`);
  }

  onMouseLeave(event: MouseEvent) {
    const card = event.currentTarget as HTMLElement;
    card.style.setProperty('--rotateX', `0deg`);
    card.style.setProperty('--rotateY', `0deg`);
  }
  
  onScrollDebounced() {
    clearTimeout(this.scrollDebounceTimer);
    this.scrollDebounceTimer = setTimeout(() => {
        this.updateCurrentIndexFromScroll();
    }, 150);
  }

  private updateCurrentIndexFromScroll() {
    const carouselEl = this.carousel()?.nativeElement;
    if (!carouselEl) return;
  
    const scrollLeft = carouselEl.scrollLeft;
    const carouselWidth = carouselEl.offsetWidth;
    let closestIndex = 0;
    let smallestDistance = Infinity;

    const children = Array.from(carouselEl.children) as HTMLElement[];
    children.forEach((child, index) => {
        const childLeft = child.offsetLeft;
        const childWidth = child.offsetWidth;
        const childCenter = childLeft + childWidth / 2;
        const carouselCenter = scrollLeft + carouselWidth / 2;
        const distance = Math.abs(childCenter - carouselCenter);

        if (distance < smallestDistance) {
            smallestDistance = distance;
            closestIndex = index;
        }
    });
  
    if (this.currentIndex() !== closestIndex) {
        this.currentIndex.set(closestIndex);
    }
  }

  goToMount(index: number) {
    const carouselEl = this.carousel()?.nativeElement;
    if (!carouselEl) return;

    // Set the index immediately for responsive UI feedback.
    this.currentIndex.set(index);

    const card = carouselEl.children[index] as HTMLElement;
    if(card) {
      const scrollLeft = card.offsetLeft - (carouselEl.offsetWidth - card.offsetWidth) / 2;
      carouselEl.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }

  next() {
    const nextIndex = this.currentIndex() + 1;
    if(nextIndex < this.mounts.length) {
      this.goToMount(nextIndex);
    }
  }

  previous() {
    const prevIndex = this.currentIndex() - 1;
    if(prevIndex >= 0) {
      this.goToMount(prevIndex);
    }
  }
}
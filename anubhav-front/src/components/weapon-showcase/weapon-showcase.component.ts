import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { TranslationService, SafeHtmlPipe } from '../../services/translation.service';

interface Weapon {
  id: string;
  nameKey: string;
  descriptionKey: string;
  image: string;
  icon: string;
  category: 'melee' | 'ranged';
}

@Component({
  selector: 'app-weapon-showcase',
  templateUrl: './weapon-showcase.component.html',
  styleUrls: ['./weapon-showcase.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SafeHtmlPipe],
})
export class WeaponShowcaseComponent implements OnInit {
  translationService = inject(TranslationService);

  activeCategory = signal<'melee' | 'ranged'>('melee');
  selectedWeaponId = signal<string>('');

  private categorySwitchSound: HTMLAudioElement;
  private weaponSelectSound: HTMLAudioElement;

  constructor() {
    if (typeof Audio !== 'undefined') {
      // A soft, short sound for category switching
      const categorySoundBase64 = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU3LjgyLjEwMAAAAAAAAAAAAAAA//tQxAAPA6AAAeB4b4kna/gU6Tj/wAATk/8cDGKEAzGgIADACADhqzv//+wB4A0T1x/A/ADAGgB//5hAC4AAIAAAIAAAAEAAABkAAAAAAAAAAAAAAAAAAAAAAAA//tQxAAPAaAAAeB8d4kna/gU6TL/wAATk/8cDGKEAzGgIADACADhqzv//+wB4A0T1x/A/ADAGgB//5hAC4AAIAAAIAAAAEAAABkAAAAAAAAAAAAAAAAAAAAAAAA//tQxAAPAaAAAeB8d4kna/gU6TL/wAATk/8cDGKEAzGgIADACADhqzv//+wB4A0T1x/A/ADAGgB//5hAC4AAIAAAIAAAAEAAABkAAAAAAAAAAAAAAAAAAAAAAAA//tQxAAPAAAAeB8d4kna/gU6TL/wAATk/8cDGKEAzGgIADACADhqzv//+wB4A0T1x/A/ADAGgB//5hAC4AAIAAAIAAAAEAAABkAAAAAAAAAAAAAAAAAAAAAAAAD/8A';
      // A slightly sharper click for weapon selection
      const weaponSelectBase64 = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU3LjgyLjEwMAAAAAAAAAAAAAAA//tQxAAPAAAAeB8d4kna/gU6TL/wAATk/8cDGKEAzGgIADACADhqzv//+wB4A0T1x/A/ADAGgB//5hAC4AAIAAAIAAAAEAAABkAAAAAAAAAAAAAAAAAAAAAAAA//tQxAAPAaAAAeB8d4kna/gU6TL/wAATk/8cDGKEAzGgIADACADhqzv//+wB4A0T1x/A/ADAGgB//5hAC4AAIAAAIAAAAEAAABkAAAAAAAAAAAAAAAAAAAAAAAA//tQxAAPAaAAAeB8d4kna/gU6TL/wAATk/8cDGKEAzGgIADACADhqzv//+wB4A0T1x/A/ADAGgB//5hAC4AAIAAAIAAAAEAAABkAAAAAAAAAAAAAAAAAAAAAAAA//tQxAAPAAAAeB8d4kna/gU6TL/wAATk/8cDGKEAzGgIADACADhqzv//+wB4A0T1x/A/ADAGgB//5hAC4AAIAAAIAAAAEAAABkAAAAAAAAAAAAAAAAAAAAAAAAD/8A';
      
      this.categorySwitchSound = new Audio(categorySoundBase64);
      this.categorySwitchSound.volume = 0.2;
      
      this.weaponSelectSound = new Audio(weaponSelectBase64);
      this.weaponSelectSound.volume = 0.4;
    } else {
      // Provide dummy objects for SSR or environments without Audio API
      const dummyAudio = { play: () => Promise.resolve(), currentTime: 0 } as HTMLAudioElement;
      this.categorySwitchSound = dummyAudio;
      this.weaponSelectSound = dummyAudio;
    }
  }

  ngOnInit(): void {
    // Set the initial selected weapon to the first one in the default category
    const initialWeapon = this.filteredWeapons()[0];
    if (initialWeapon) {
      this.selectedWeaponId.set(initialWeapon.id);
    }
  }

  allWeapons = signal<Weapon[]>([
    // Melee
    { id: 'dagger', nameKey: 'weapon.dagger.name', descriptionKey: 'weapon.dagger.desc', image: 'https://picsum.photos/seed/dagger/1024/576', icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M10 21v-5l-3.3-3.3a1.5 1.5 0 0 1 0-2.12l1.42-1.42a1.5 1.5 0 0 1 2.12 0L12 10.58l1.77-1.77a1.5 1.5 0 0 1 2.12 0l1.42 1.42a1.5 1.5 0 0 1 0 2.12L14 16v5m-4 0h4" />`, category: 'melee' },
    { id: 'longsword', nameKey: 'weapon.longsword.name', descriptionKey: 'weapon.longsword.desc', image: 'https://picsum.photos/seed/longsword/1024/576', icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M7 21V9.75a5.25 5.25 0 0110.5 0V21M12 3v6.75" /><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6" />`, category: 'melee' },
    { id: 'spear', nameKey: 'weapon.spear.name', descriptionKey: 'weapon.spear.desc', image: 'https://picsum.photos/seed/spear/1024/576', icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M3 21L21 3" /><path stroke-linecap="round" stroke-linejoin="round" d="M18.5 2.5l3 3L16 10l-3-3 5.5-4.5z" />`, category: 'melee' },
    { id: 'greataxe', nameKey: 'weapon.greataxe.name', descriptionKey: 'weapon.greataxe.desc', image: 'https://picsum.photos/seed/greataxe/1024/576', icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M 12,3 V 21 M 3,10 H 21" /><path stroke-linecap="round" stroke-linejoin="round" d="M4,4 C-2,12 4,20 4,20 H12 V4 H4 z M20,4 C26,12 20,20 20,20 H12 V4 H20 z" />`, category: 'melee' },
    // Ranged
    { id: 'longbow', nameKey: 'weapon.longbow.name', descriptionKey: 'weapon.longbow.desc', image: 'https://picsum.photos/seed/longbow/1024/576', icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M3 21c7-4 11-10 12-18M21 3c-4 7-10 11-18 12" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 12l9-9M12 12L3 21" />`, category: 'ranged' },
    { id: 'crossbow', nameKey: 'weapon.crossbow.name', descriptionKey: 'weapon.crossbow.desc', image: 'https://picsum.photos/seed/crossbow/1024/576', icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M2 12h18M12 2l-2 5h4l-2-5z" /><path stroke-linecap="round" stroke-linejoin="round" d="M5 7c-2 2-2 6 0 8m14-8c2 2 2 6 0 8" />`, category: 'ranged' },
  ]);

  filteredWeapons = computed(() => this.allWeapons().filter(w => w.category === this.activeCategory()));
  selectedWeapon = computed(() => this.allWeapons().find(w => w.id === this.selectedWeaponId()));

  selectCategory(category: 'melee' | 'ranged') {
    if (this.activeCategory() === category) return;
    this.activeCategory.set(category);
    this.selectedWeaponId.set(this.filteredWeapons()[0]?.id || '');
    this.playSound(this.categorySwitchSound);
  }

  selectWeapon(weaponId: string) {
    if (this.selectedWeaponId() === weaponId) return;
    this.selectedWeaponId.set(weaponId);
    this.playSound(this.weaponSelectSound);
  }

  private playSound(sound: HTMLAudioElement) {
    if (sound?.play) {
      sound.currentTime = 0;
      sound.play().catch(error => {
        // Autoplay is often blocked by browsers. This is a common error and can be ignored for this use case.
        console.log('Could not play sound, user may need to interact with the page first.', error);
      });
    }
  }
}
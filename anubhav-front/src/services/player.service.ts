import { Injectable, signal, computed } from '@angular/core';

export interface MatchRecord {
  id: string;
  gameMode: string;
  result: 'victory' | 'defeat';
  ratio: string;
  mvp: boolean;
  date: string;
}

export interface Achievement {
  id: string;
  titleKey: string;
  locked: boolean;
  progress: number;
}

@Injectable({ providedIn: 'root' })
export class PlayerService {
  // Reactive Player Stats
  playerLevel = signal(42);
  playerXP = signal(750); // Current XP in current level
  maxXP = signal(1000);   // Max XP for current level
  playerRank = signal('dashboard.rank.adept');
  
  // Progress computation
  xpPercentage = computed(() => (this.playerXP() / this.maxXP()) * 100);

  // Mock data for player dashboard
  matchHistory = signal<MatchRecord[]>([
    { id: '1', gameMode: 'PVP Arena', result: 'victory', ratio: '12/2/8', mvp: true, date: '2024-03-20' },
    { id: '2', gameMode: 'Raid: Dragon\'s Peak', result: 'victory', ratio: '8/4/15', mvp: false, date: '2024-03-19' },
    { id: '3', gameMode: 'PVP TDM', result: 'defeat', ratio: '5/10/3', mvp: false, date: '2024-03-18' },
    { id: '4', gameMode: 'World Boss', result: 'victory', ratio: '22/0/45', mvp: true, date: '2024-03-17' },
  ]);

  achievements = signal<Achievement[]>([
    { id: '1', titleKey: 'Dragon Slayer', locked: false, progress: 100 },
    { id: '2', titleKey: 'Master Alchemist', locked: false, progress: 100 },
    { id: '3', titleKey: 'Arena Champion', locked: true, progress: 65 },
    { id: '4', titleKey: 'World Traveler', locked: true, progress: 40 },
  ]);

  addXP(amount: number) {
    const newXP = this.playerXP() + amount;
    if (newXP >= this.maxXP()) {
      this.playerLevel.update(l => l + 1);
      this.playerXP.set(newXP - this.maxXP());
    } else {
      this.playerXP.set(newXP);
    }
  }
}

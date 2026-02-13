
import { Routes } from '@angular/router';
import { HomeComponent } from './components/hero/hero.component';
import { AnnouncementsComponent } from './components/announcements/announcements.component';
import { OverviewComponent } from './components/overview/overview.component';
import { CampaignGroundsComponent } from './components/campaign-grounds/campaign-grounds.component';
import { CommunityComponent } from './components/community/community.component';
import { DownloadComponent } from './components/download/download.component';
import { SupportComponent } from './components/support/support.component';
import { PlayerDashboardComponent } from './components/player-dashboard/player-dashboard.component';

export const APP_ROUTES: Routes = [
  { path: '', component: HomeComponent, title: 'XAE | Home' },
  { path: 'dashboard', component: PlayerDashboardComponent, title: 'XAE | Dashboard' },
  { path: 'announcements', component: AnnouncementsComponent, title: 'XAE | Announcements' },
  { path: 'overview', component: OverviewComponent, title: 'XAE | Game Overview' },
  { path: 'campaign-grounds', component: CampaignGroundsComponent, title: 'XAE | Campaign Grounds' },
  { path: 'community', component: CommunityComponent, title: 'XAE | Community' },
  { path: 'download', component: DownloadComponent, title: 'XAE | Download' },
  { path: 'support', component: SupportComponent, title: 'XAE | Support' },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
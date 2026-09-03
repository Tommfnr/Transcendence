import { Component, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RequestCard } from '../../components/request-card/request-card';
import { HelpRequest } from '../../models/help-request.model';

type DashboardTab = 'requests' | 'offers';

@Component({
  selector: 'app-dashboard',
  imports: [NgClass, RouterLink, RequestCard],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  readonly activeTab = signal<DashboardTab>('requests');

  readonly requestCount = 3;
  readonly offerCount = 2;

  readonly requests = signal<HelpRequest[]>([
    {
      id: 1,
      authorName: 'Sarah',
      groupName: 'Voisins Bellevue',
      timeAgo: 'il y a 2h',
      title: 'Je cherche une perceuse',
      description:
        "Je renove ma cuisine ce week-end et j'aurais besoin d'une perceuse pour quelques trous.",
      tags: [
        { icon: 'calendar', label: 'Sans preference' },
        { icon: 'tag', label: 'Bricolage' },
      ],
    },
    {
      id: 2,
      authorName: 'Julien',
      groupName: 'Les super potes',
      timeAgo: 'il y a 2h',
      title: 'Je cherche un appareil a raclette',
      description: "Soiree en famille vendredi. Si quelqu'un en a un a preter, merci!",
      tags: [
        { icon: 'calendar', label: '17/05-18/05' },
        { icon: 'tag', label: 'Maison' },
      ],
      status: 'pending',
    },
    {
      id: 3,
      authorName: 'Jean',
      groupName: 'Famille',
      timeAgo: 'il y a 2h',
      title: 'Je cherche une souris de depannage',
      description: "J'ai casse ma souris et ma nouvelle souris arrive dans une semaine",
      tags: [{ icon: 'calendar', label: '7 jours' }],
    },
    {
      id: 4,
      authorName: 'Jean',
      groupName: 'Famille',
      timeAgo: 'il y a 2h',
      title: 'Je cherche une souris de depannage',
      description: "J'ai casse ma souris et ma nouvelle souris arrive dans une semaine",
      tags: [{ icon: 'calendar', label: '7 jours' }],
    },
  ]);

  selectTab(tab: DashboardTab): void {
    this.activeTab.set(tab);
  }

  onHelp(request: HelpRequest): void {
    // TODO: send the offer of help once the API endpoint exists.
    void request;
  }

  readonly fabOpen = signal(false);

  toggleFab(): void {
    this.fabOpen.update(open => !open);
  }

  closeFab(): void {
    this.fabOpen.set(false);
  }
}

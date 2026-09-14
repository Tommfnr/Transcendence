import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal.service';
import { RequestCard } from '../../components/request-card/request-card';
import { HelpRequest } from '../../models/help-request.model';
import { StatCardComponent } from '../../components/stat-card/stat-card';
import { GroupsService } from '../../services/groups.service';
import { GroupEntity } from '../../models/group.model';
import { PostsService } from '../../services/posts.service';
import { PostEntity } from '../../models/post.model';

type DashboardTab = 'requests' | 'offers';

@Component({
  selector: 'app-dashboard',
  imports: [NgClass, RouterLink, RequestCard, StatCardComponent],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private groupsService = inject(GroupsService);
  private postsService = inject(PostsService);

  readonly posts = signal<PostEntity[]>([]);
  readonly selectedGroupId = signal<number | null>(null);
  private postGroupIds = signal<Map<number, number[]>>(new Map());

  readonly filteredPosts = computed(() => {
    const groupId = this.selectedGroupId();
    if (groupId === null) {
      return this.posts();
    }

    const postGroupIds = this.postGroupIds();
    return this.posts().filter((post) => postGroupIds.get(post.id)?.includes(groupId) ?? false);
  });

  readonly modalService = inject(ModalService);

  readonly activeTab = signal<DashboardTab>('requests');

  readonly groups = signal<GroupEntity[]>([]);
  readonly errorMessage = signal<string | null>(null);

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
 /*   {
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
    },*/
  ]);

  ngOnInit(): void {
    this.groupsService.findMy().subscribe({
      next: (data) => this.groups.set(data),
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Error while showing group(s)');
      },
    });

    this.postsService.findMy().subscribe((data) => {
      this.posts.set(data);

      for (const post of data) {
        this.postsService.findGroups(post.id).subscribe((groups) => {
          this.postGroupIds.update((map) => new Map(map).set(post.id, groups.map((group) => group.id)));
        });
      }
    });
  }

  selectTab(tab: DashboardTab): void {
    this.activeTab.set(tab);
  }

  onGroupFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedGroupId.set(value === '' ? null : Number(value));
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

  openAddObjectModal(): void {
    this.closeFab();
    this.modalService.openAddObject();
  }

  openAddPostModal(): void {
    this.closeFab();
    this.modalService.openAddPost();
  }

  openAddGroupModal(): void {
    this.closeFab();
    this.modalService.openAddGroup();
  }
}

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
import { HeaderAppComponent } from '../../components/header-app/header-app';
import { FabActionComponent } from '../../components/fab-action/fab-action';
import { PostEntity, PostGroupData } from '../../models/post.model';
import { UsersService } from '../../services/users.service';
import { User } from '../../models/user.model';



type DashboardTab = 'requests' | 'offers';

@Component({
  selector: 'app-dashboard',
  imports: [NgClass, RouterLink, RequestCard, StatCardComponent, HeaderAppComponent, FabActionComponent],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {

  private usersService = inject(UsersService);
  private authors = signal<Map<number, User>>(new Map());

  private groupsService = inject(GroupsService);
  private postsService = inject(PostsService);

  readonly posts = signal<PostEntity[]>([]);
  readonly selectedGroupId = signal<number | null>(null);
  private postGroup = signal<Map<number, PostGroupData[]>>(new Map());

  readonly filteredPosts = computed(() => {
    const groupId = this.selectedGroupId();
    if (groupId === null) {
      return this.posts();
    }

    const postGroup = this.postGroup();
    return this.posts().filter((post) => postGroup.get(post.id)?.some((group) => group.id === groupId) ?? false);
  });

  readonly displayedRequests = computed<HelpRequest[]>(() =>
    this.filteredPosts().map((post) => this.toHelpRequest(post))
  );

  readonly modalService = inject(ModalService);

  readonly activeTab = signal<DashboardTab>('requests');

  readonly groups = signal<GroupEntity[]>([]);
  readonly errorMessage = signal<string | null>(null);

  readonly requestCount = computed(() => this.displayedRequests().length);
  readonly offerCount = 2;



  ngOnInit(): void {
    this.groupsService.findMy().subscribe({
      next: (data) => this.groups.set(data),
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Error while showing group(s)');
      },
    });

    this.postsService.findFromMyGroups().subscribe((data) => {
      this.posts.set(data);

      const ownerIds = new Set(data.map((post) => post.ownerId));
      for (const ownerId of ownerIds) {
        this.usersService.findOne(ownerId).subscribe({
          next: (user) => this.authors.update((map) => new Map(map).set(ownerId, user)),
          error: (err) => console.error('Failed to load author', err),
        });
      }

      for (const post of data) {
        this.postsService.findGroups(post.id).subscribe((groups) => {
          this.postGroup.update((map) => new Map(map).set(post.id, groups));
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

  /** Transforme un PostEntity brut en HelpRequest utilisable par RequestCard. */
  private toHelpRequest(post: PostEntity): HelpRequest {
    const groups = this.postGroup().get(post.id) ?? [];

    return {
      id: post.id,
      authorName: this.authors().get(post.ownerId)?.username ?? '',
      groupName: groups.map((g) => g.name).join(', ') || 'Aucun groupe',
      timeAgo: this.formatTimeAgo(post.createdAt),
      title: post.title,
      description: post.description ?? '',
      tags: [
        { icon: 'tag', label: post.objectType },
        { icon: 'calendar', label: this.formatDateRange(post.fromDate, post.toDate) },
      ],
      status: post.status === 'closed' ? 'done' : 'open',
    };
  }

  private formatTimeAgo(dateIso: string): string {
    const diffMs = Date.now() - new Date(dateIso).getTime();
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffH < 1) return "il y a moins d'1h";
    if (diffH < 24) return `il y a ${diffH}h`;
    const diffJ = Math.floor(diffH / 24);
    return `il y a ${diffJ}j`;
  }

  private formatDateRange(fromDate: string, toDate: string): string {
    const from = new Date(fromDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    const to = new Date(toDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    return `${from}-${to}`;
  }
}

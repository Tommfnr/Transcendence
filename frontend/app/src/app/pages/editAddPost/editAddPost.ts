import { Component, OnInit, inject, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostsService } from '../../services/posts.service';
import { GroupsService } from '../../services/groups.service';
import { PostInput, PostGroupData } from '../../models/post.model';
import { GroupEntity } from '../../models/group.model';
import { OBJECT_TYPES } from '../../models/object.model';
import { ButtonComponent } from '../../components/button/button';

@Component({
  selector: 'app-editAddPost',
  imports: [FormField, ButtonComponent, RouterLink],
  templateUrl: './editAddPost.html',
})
export class EditAddPost implements OnInit {
  private postsService = inject(PostsService);
  private groupsService = inject(GroupsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private postId = this.route.snapshot.paramMap.get('id');
  readonly isEditMode = !!this.postId;

  readonly myGroups = signal<GroupEntity[]>([]);
  readonly myPostGroups = signal<PostGroupData[]>([]);
  readonly objectTypes = OBJECT_TYPES;

  private post = signal<PostInput>({
    title: '',
    objectType: OBJECT_TYPES[0],
    description: '',
    status: 'open',
    fromDate: '',
    toDate: '',
    groupIds: [],
  });

  postForm = form(this.post, (fieldPath) => {
    required(fieldPath.title, { message: 'Title is required' });
    required(fieldPath.fromDate, { message: 'Start date is required' });
    required(fieldPath.toDate, { message: 'End date is required' });
  });

  ngOnInit(): void {
    if (this.isEditMode) {
      this.postsService.findOne(Number(this.postId)).subscribe((data) => {
        this.post.set({
          title: data.title,
          objectType: data.objectType,
          description: data.description ?? '',
          status: data.status,
          fromDate: data.fromDate,
          toDate: data.toDate,
        });
      });

      this.postsService.findGroups(Number(this.postId)).subscribe((postGroups) => {
        this.myPostGroups.set(postGroups);
      });
    } else {
      this.groupsService.findMy().subscribe((groups) => {
        this.myGroups.set(groups);
      });
    }
  }

  onGroupToggle(event: Event, groupId: number): void {
    const checked = (event.target as HTMLInputElement).checked;

    this.post.update((current) => {
      const ids = current.groupIds ?? [];

      return {
        ...current,
        groupIds: checked ? [...ids, groupId] : ids.filter((id) => id !== groupId),
      };
    });
  }

  onSubmit(event: Event) {
    event.preventDefault();

    submit(this.postForm, async () => {
      let request;

      if (this.isEditMode) {
        request = this.postsService.update(Number(this.postId), this.post());
      } else {
        request = this.postsService.create(this.post());
      }

      request.subscribe({
        next: () => {
          this.router.navigate(['/app/dashboard']);
        },
      });
    });
  }
}

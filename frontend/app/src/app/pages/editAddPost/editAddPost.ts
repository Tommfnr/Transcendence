import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { PostsService } from '../../services/posts.service';
import { GroupsService } from '../../services/groups.service';
import { PostInput, PostGroupData } from '../../models/post.model';
import { GroupEntity } from '../../models/group.model';
import { OBJECT_TYPES, ObjectType } from '../../models/object.model';
import { ButtonComponent } from '../../components/button/button';
import { ButtonDirective } from '../../components/button/button.directive';
import { Modal } from '../../components/modal/modal';
import { ModalService } from '../../services/modal.service';
import { firstValueFrom } from 'rxjs';
import { isZodValidationError, mapZodErrorsToFieldTree } from '../../shared/zod-signal-errors';
import { SelectPillComponent } from '../../components/select-pill/select-pill';
import { TextFieldComponent } from '../../components/text-field/text-field';
import { ChipComponent } from '../../components/chip/chip';


@Component({
	selector: 'app-editAddPost',
	imports: [FormField, ButtonDirective, SelectPillComponent, Modal, TextFieldComponent, ChipComponent],
	templateUrl: './editAddPost.html',
})
export class EditAddPost implements OnInit {
	private postsService = inject(PostsService);
	private groupsService = inject(GroupsService);
	private modalService = inject(ModalService);

	private postId = this.modalService.editPostId();
	readonly isEditMode = computed(() => this.modalService.editPostId() !== null);

	readonly myGroups = signal<GroupEntity[]>([]);
	readonly myPostGroups = signal<PostGroupData[]>([]);
	readonly objectTypes = OBJECT_TYPES;

	readonly categories = [
		{ label: 'DIY', emoji: '🛠️' },
		{ label: 'Electronics', emoji: '💻' },
		{ label: 'Leisure', emoji: '🎾' },
		{ label: 'Other', emoji: '📦' },
	] as const;

	readonly selectedGroupIds = signal<Set<number>>(new Set());

	bannerErrors = signal<string[]>([]);

	private post = signal<PostInput>({
		title: '',
		objectType: OBJECT_TYPES[0],
		description: '',
		status: 'open',
		fromDate: '',
		toDate: '',
		groupIds: [],
	});

	readonly postValue = this.post.asReadonly();

	postForm = form(this.post, (fieldPath) => {
		required(fieldPath.title, { message: 'Title is required' });
		required(fieldPath.fromDate, { message: 'Start date is required' });
		required(fieldPath.toDate, { message: 'End date is required' });
	});

	ngOnInit(): void {
		if (this.isEditMode()) {
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
				this.selectedGroupIds.set(new Set(groups.map((g) => g.id)));
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

		submit(this.postForm, async (field) => {
			try {
				this.bannerErrors.set([]);

				const response = this.postId
					? await firstValueFrom(this.postsService.update(Number(this.postId), this.post()))
					: await firstValueFrom(this.postsService.create(this.post()));

				this.modalService.close();
				return (undefined)
			}
			catch (err) {
				if (isZodValidationError(err)) {
					const { fieldErrors, bannerErrors } = mapZodErrorsToFieldTree(err.error, field);

					this.bannerErrors.set(bannerErrors);
					return (fieldErrors);
				}
				this.bannerErrors.set(['Something went wrong, please try again']);
				return (undefined);
			}
		});
	}

	onCancel(): void {
		this.modalService.close();
	}

	toggleGroup(id: number): void {
		this.selectedGroupIds.update((current) => {
			const next = new Set(current);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	readonly groupsLabel = computed(() => {
		if (this.allSelected()) return 'All my groups';
		const selected = this.selectedGroupIds();
		if (selected.size === 0) return 'Choose groups';
		if (selected.size === 1) {
			return this.myGroups().find((g) => selected.has(g.id))?.name ?? '1 group';
		}
		return `${selected.size} groups`
	});

	checkboxClasses(checked: boolean): string {
		const base = 'flex size-[18px] shrink-0 items-center justify-center rounded-[4px]';
		return checked
			? `${base} bg-complementary text-white`
			: `${base} border-2 border-text-secondary`;
	}

	readonly allSelected = computed(() =>
		this.myGroups().length > 0 && this.selectedGroupIds().size == this.myGroups().length);

	toggleAllGroups(): void {
		if (this.allSelected()) {
			this.selectedGroupIds.set(new Set());
		} else {
			this.selectedGroupIds.set(new Set(this.myGroups().map((g) => g.id)));
		}
	}

	setObjectType(type: ObjectType): void {
		this.post.update((p) => ({ ...p, objectType: type }));
	}
}

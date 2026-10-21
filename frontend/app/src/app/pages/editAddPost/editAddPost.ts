import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { form, FormField, required, submit, validate } from '@angular/forms/signals';
import { PostsService } from '../../services/posts.service';
import { GroupsService } from '../../services/groups.service';
import { PostInput, PostGroupData } from '../../models/post.model';
import { GroupEntity } from '../../models/group.model';
import { OBJECT_TYPES, ObjectType } from '../../models/object.model';
import { ButtonDirective } from '../../components/button/button.directive';
import { Modal } from '../../components/modal/modal';
import { ModalService } from '../../services/modal.service';
import { firstValueFrom } from 'rxjs';
import { isZodValidationError, mapZodErrorsToFieldTree } from '../../shared/zod-signal-errors';
import { SelectPillComponent } from '../../components/select-pill/select-pill';
import { TextFieldComponent } from '../../components/text-field/text-field';
import { ErrorBannerComponent } from '../../components/error-banner/error-banner';
import { ChipComponent } from '../../components/chip/chip';
import { DatePicker, todayIso } from '../../components/date-picker/date-picker';

@Component({
	selector: 'app-editAddPost',
	imports: [FormField, ButtonDirective, SelectPillComponent, Modal, TextFieldComponent, ChipComponent, DatePicker, ErrorBannerComponent],
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

	readonly bannerErrors = signal<string[]>([]);

	readonly today = todayIso();

	readonly minToDate = computed(() => {
		const from = this.postForm.fromDate().value() || this.today;

		const nextDay = new Date(from);
		nextDay.setUTCDate(nextDay.getUTCDate() + 1);
		return (nextDay.toISOString().slice(0, 10));
	});

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
		validate(fieldPath.toDate, ({ value, valueOf }) => {
			const from = valueOf(fieldPath.fromDate);
			if (from && value() && value() <= from)
				return ({ kind: 'dateOrder', message: 'End date must be after the start date' });
			return (undefined);
		});

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

	onSubmit(event: Event) {
		event.preventDefault();

		submit(this.postForm, async (field) => {
			try {
				this.bannerErrors.set([]);

				const response = this.postId
					? await firstValueFrom(this.postsService.update(Number(this.postId), this.post()))
					: await firstValueFrom(this.postsService.create({ ...this.post(), groupIds: Array.from(this.selectedGroupIds()) }));

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
			? `${base} bg-primary text-on-primary`
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

import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { GroupsService } from '../../services/groups.service';
import { UsersService } from '../../services/users.service';
import { GroupInput, GroupMemberView } from '../../models/group.model';
import { Modal } from '../../components/modal/modal';
import { ModalService } from '../../services/modal.service';
import { RefreshService } from '../../services/refresh.service';
import { firstValueFrom, forkJoin, map, of, switchMap } from 'rxjs';
import { isZodValidationError, mapZodErrorsToFieldTree } from '../../shared/zod-signal-errors';
import { TextFieldComponent } from '../../components/text-field/text-field';
import { ButtonDirective } from '../../components/button/button.directive';
import { AvatarComponent } from '../../components/avatar/avatar';

@Component({
	selector: 'app-editAddGroup',
	imports: [FormField, ButtonDirective, Modal, TextFieldComponent, AvatarComponent],
	templateUrl: './editAddGroup.html',
})

export class EditAddGroup implements OnInit {
	private groupsService = inject(GroupsService);
	private usersService = inject(UsersService);
	private modalService = inject(ModalService);
	private refreshService = inject(RefreshService);

	private groupId = this.modalService.editGroupId();
	readonly isEditMode = computed(() => this.modalService.editGroupId() !== null);


	readonly newMemberUsername = signal('');

	readonly members = signal<GroupMemberView[]>([]);
	readonly ownerId = signal<number | null>(null);
	readonly currentUserId = computed(() => this.refreshService.user()?.id ?? null);
	readonly isOwner = computed(() => this.ownerId() !== null && this.ownerId() === this.currentUserId());
	readonly isAdmin = computed(() =>
		this.members().some((member) => member.userId === this.currentUserId() && member.role === 'admin'));


	bannerErrors = signal<string[]>([]);

	group = signal<GroupInput>({
		name: '',
		description: '',
	});

	readonly errorMessage = signal<string | null>(null);

	groupForm = form(this.group, (fieldPath) => {
		required(fieldPath.name, { message: 'Name is required' });
	});

	ngOnInit(): void {
		if (this.isEditMode()) {
			this.groupsService.findOne(Number(this.groupId)).subscribe((data) => {
				this.group.set({ name: data.name, description: data.description ?? '' });
				this.ownerId.set(data.ownerId);
			});
			this.loadMembers();
		}
	}

	private loadMembers(): void {
		this.groupsService.findMembers(Number(this.groupId)).pipe(
			switchMap((members) => members.length === 0
				? of([])
				: forkJoin(members.map((member) =>
					this.usersService.findOne(member.userId).pipe(
						map((user) => ({ ...member, username: user.username })),
					),
				)),
			),
		).subscribe((members) => this.members.set(members));
	}

	roleLabel(member: GroupMemberView): string {
		if (member.userId === this.ownerId())
			return ('Owner');
		return (member.role === 'admin' ? 'Admin' : 'Member');
	}

	onAddMember(username: string): void {
		const trimmed = username.trim();
		if (!trimmed)
			return;

		this.errorMessage.set(null);
		this.usersService.findByUsername(trimmed).pipe(
			switchMap((user) => this.groupsService.addMember(Number(this.groupId), user.id)),
		).subscribe({
			next: () => this.loadMembers(),
			error: (err) => {
				this.errorMessage.set(err.error?.message ?? 'Could not add this member');
			},
		});
	}

	onToggleRole(member: GroupMemberView): void {
		const role = member.role === 'admin' ? 'member' : 'admin';

		this.errorMessage.set(null);
		this.groupsService.updateMemberRole(Number(this.groupId), member.userId, { role }).subscribe({
			next: (updated) => {
				this.members.update((members) => members.map((m) =>
					m.userId === updated.userId ? { ...m, role: updated.role } : m));
			},
			error: (err) => {
				this.errorMessage.set(err.error?.message ?? 'Could not change this member role');
			},
		});
	}

	onRemoveMember(member: GroupMemberView): void {
		this.errorMessage.set(null);
		this.groupsService.removeMember(Number(this.groupId), member.userId).subscribe({
			next: () => {
				this.members.update((members) => members.filter((m) => m.userId !== member.userId));
			},
			error: (err) => {
				this.errorMessage.set(err.error?.message ?? 'Could not remove this member');
			},
		});
	}

	onDeleteGroup(): void {
		if (!confirm(`Delete "${this.group().name}"? This cannot be undone.`))
			return;

		this.errorMessage.set(null);
		this.groupsService.deleteGroup(Number(this.groupId)).subscribe({
			next: () => this.modalService.close(),
			error: (err) => {
				this.errorMessage.set(err.error?.message ?? 'Could not delete this group');
			},
		});
	}

	onSubmit(event: Event) {
		event.preventDefault();

		submit(this.groupForm, async (field) => {
			try {
				this.bannerErrors.set([]);

				const response = this.groupId
					? await firstValueFrom(this.groupsService.update(Number(this.groupId), this.group()))
					: await firstValueFrom(this.groupsService.create(this.group()));

				this.modalService.close();
				return (undefined);
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
}

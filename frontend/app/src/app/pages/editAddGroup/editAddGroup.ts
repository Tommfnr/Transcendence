import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { GroupsService } from '../../services/groups.service';
import { UsersService } from '../../services/users.service';
import { GroupInput } from '../../models/group.model';
import { Modal } from '../../components/modal/modal';
import { ModalService } from '../../services/modal.service';
import { firstValueFrom } from 'rxjs';
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

	private groupId = this.modalService.editGroupId();
	readonly isEditMode = computed(() => this.modalService.editGroupId() !== null);


	readonly newMemberUsername = signal('');


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
			});
		}
	}

	onAddMember(username: string): void {
		this.usersService.findByUsername(username).subscribe({
			next: (user) => {
				this.groupsService.addMember(Number(this.groupId), user.id).subscribe();
			},
			error: (err) => {
				this.errorMessage.set(err.error?.message);
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

	/* DEMO — TODO(wiring): remplacer par la vraie logique (voir note de passation)
	   isAdmin = mon role === 'admin' ; isOwner = group.ownerId === utilisateur courant */

	readonly isAdmin: boolean = true;
	readonly isOwner: boolean = true;

	readonly demoMembers = signal([
		{ id: 1, name: 'Pierre', role: 'Owner', isYou: true },
		{ id: 2, name: 'Julien', role: 'Member', isYou: false },
		{ id: 3, name: 'Marine', role: 'Admin', isYou: false },
		{ id: 4, name: 'John', role: 'Member', isYou: false },
		{ id: 5, name: 'Sebastian', role: 'Member', isYou: false },
		{ id: 6, name: 'Julien', role: 'Member', isYou: false },
		{ id: 7, name: 'Marine', role: 'Member', isYou: false },
		{ id: 8, name: 'John', role: 'Member', isYou: false },
		{ id: 9, name: 'Sebastian', role: 'Member', isYou: false },
		{ id: 10, name: 'Julien', role: 'Member', isYou: false },
		{ id: 11, name: 'Marine', role: 'Member', isYou: false },
		{ id: 12, name: 'John', role: 'Member', isYou: false },
		{ id: 13, name: 'Sebastian', role: 'Member', isYou: false },
	]);

}

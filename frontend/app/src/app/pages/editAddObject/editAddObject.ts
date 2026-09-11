import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { ObjectService } from '../../services/object.service';
import { GroupsService } from '../../services/groups.service';
import { ObjectInput, OBJECT_TYPES, ObjectCondition, ObjectType } from '../../models/object.model';
import { GroupEntity } from '../../models/group.model';
import { ButtonComponent } from '../../components/button/button';
import { Modal } from '../../components/modal/modal';
import { ModalService } from '../../services/modal.service';
import { TextFieldComponent } from '../../components/text-field/text-field';
import { ChipComponent } from "../../components/chip/chip";

@Component({
	selector: 'app-editAddObject',
	imports: [FormField, ButtonComponent, Modal, TextFieldComponent, ChipComponent],
	templateUrl: './editAddObject.html',
})
export class EditAddObject implements OnInit {
	private objectService = inject(ObjectService);
	private groupsService = inject(GroupsService);
	private modalService = inject(ModalService);
	
	private objectId = this.modalService.editObjectId();
	readonly isEditMode = computed(() => this.modalService.editObjectId() !== null);

	readonly myGroups = signal<GroupEntity[]>([]);
	readonly selectedGroupIds = signal<number[]>([]);
	readonly objectTypes = OBJECT_TYPES;

	readonly categories = [
		{ label: 'Tools', emoji: '🛠️' },
		{ label: 'Electronics', emoji: '💻' },
		{ label: 'Vehicles', emoji: '🚗' },
		{ label: 'Outdoor & Recreation', emoji: '🏕️' },
		{ label: 'Media', emoji: '🎬' },
		{ label: 'Events', emoji: '🎉' },
		{ label: 'Clothing & Gear', emoji: '🧥' },
	] as const;

	states = [
		{ label: 'New', value: 'new' },
		{ label: 'Good', value: 'good' },
		{ label: 'Worn', value: 'worn' }
	] as const;

	object = signal<ObjectInput>({
		name: '',
		type: OBJECT_TYPES[0],
		description: '',
		condition: 'new',
		isAvailable: true,
	});

	objectForm = form(this.object, (fieldPath) => {
		required(fieldPath.name, { message: 'Name is required' });
		required(fieldPath.type, { message: 'Type is required' });
	});

	ngOnInit(): void {
		if (this.objectId) {
			this.objectService.findOne(Number(this.objectId)).subscribe((data) => {
				this.object.set({
					name: data.name,
					type: data.type,
					description: data.description ?? '',
					condition: data.condition,
					isAvailable: data.isAvailable,
				});
			});
		} else {
			this.groupsService.findMy().subscribe((groups) => {
				this.myGroups.set(groups);
			});
		}
	}

	onGroupToggle(event: Event, groupId: number): void {
		const checked = (event.target as HTMLInputElement).checked;
		const ids = this.selectedGroupIds();

		if (checked) {
			this.selectedGroupIds.set([...ids, groupId]);
		} else {
			this.selectedGroupIds.set(ids.filter((id) => id !== groupId));
		}
	}

	onSubmit(event: Event) {
		event.preventDefault();

		submit(this.objectForm, async () => {
			let request;
			if (this.objectId) {
				request = this.objectService.update(Number(this.objectId), this.object());
			} else {
				request = this.objectService.create(this.object());
			}

			request.subscribe((response) => {
				if (response.length === 0) {
					return;
				}

				if (!this.objectId) {
					const newObjectId = response[0].id;
					for (const groupId of this.selectedGroupIds()) {
						this.groupsService.grantObject(groupId, newObjectId).subscribe();
					}
				}

				this.modalService.close();
			});
		});
	}

	onCancel(): void {
		this.modalService.close();
	}

	setType(type: ObjectType) {
		this.object.update(model => ({ ...model, type }));
	}

	setCondition(condition: ObjectCondition) {
		this.object.update(model => ({ ...model, condition }));
	}
}

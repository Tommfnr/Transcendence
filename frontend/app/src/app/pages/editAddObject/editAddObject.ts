import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { ObjectService } from '../../services/object.service';
import { ObjectInput, OBJECT_TYPES, ObjectCondition, ObjectType } from '../../models/object.model';
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
	private modalService = inject(ModalService);

	readonly isEditMode = computed(() => this.modalService.editObjectId() !== null);

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
		const objectId = this.modalService.editObjectId();
		if (objectId) {
			this.objectService.findOne(Number(objectId)).subscribe((data) => {
				this.object.set({
					name: data.name,
					type: data.type,
					description: data.description ?? '',
					condition: data.condition,
					isAvailable: data.isAvailable,
				});
			});
		}
	}

	onSubmit(event: Event) {
		event.preventDefault();

		submit(this.objectForm, async () => {
			const objectId = this.modalService.editObjectId();
			let request;
			if (objectId) {
				request = this.objectService.update(Number(objectId), this.object());
			} else {
				request = this.objectService.create(this.object());
			}

			request.subscribe((response) => {
				if (response.length === 0) {
					return;
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

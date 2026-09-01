// This helper translates a backend HTTP error response (the structured JSON returned by nestjs-zod on a 400) into the format Angular Signal Forms requires to display an error under the matching field.

import { HttpErrorResponse } from '@angular/common/http';
import { FieldTree } from '@angular/forms/signals';

interface ZodErrorBody {
	statusCode: number;
	message: string;
	errors: Record<string, string[]>;
	formErrors: string[];
}

export function isZodValidationError(err: unknown): err is HttpErrorResponse & { error: ZodErrorBody } {
	return (
		err instanceof HttpErrorResponse && err.status === 400 && typeof err.error?.errors === 'object' && Array.isArray(err.error?.formErrors)
	);
}

export function mapZodErrorsToFieldTree<T>(body: ZodErrorBody, field: FieldTree<T, string | number, 'writable'>) {
	const fieldErrors: { fieldTree: unknown; kind: string; message: string }[] = [];
	const bannerErrors: string[] = [...body.formErrors];

	for (const [dtoKey, messages] of Object.entries(body.errors)) {
		const target = (field as any)[dtoKey];
		if (target) {
			messages.forEach((message) => fieldErrors.push({ fieldTree: target, kind: 'server', message }));
		}
		else {
			bannerErrors.push(...messages);
		}
	}

	return { fieldErrors, bannerErrors };
}
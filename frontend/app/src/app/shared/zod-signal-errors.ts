// This helper translates a backend HTTP error response (the structured JSON returned by nestjs-zod on a 400) into the format Angular Signal Forms requires to display an error under the matching field.

import { HttpErrorResponse } from '@angular/common/http';
import { FieldTree, ValidationError } from '@angular/forms/signals';

interface ZodErrorBody {
	statusCode: number;
	message: string;
	errors: Record<string, string[]>;
	formErrors: string[];
}

interface AuthErrorBody {
    statusCode: number;
    message: string;
}

export function isZodValidationError(err: unknown): err is HttpErrorResponse & { error: ZodErrorBody } {
	return (
		err instanceof HttpErrorResponse && err.status === 400 && typeof err.error?.errors === 'object' && Array.isArray(err.error?.formErrors)
	);
}

export function isAuthError(err: unknown): err is HttpErrorResponse & { error: AuthErrorBody } {
    return (
		err instanceof HttpErrorResponse && err.status === 401 && typeof err.error?.message === 'string'
	);
}

export function isConflictError(err: unknown): err is HttpErrorResponse & { error: AuthErrorBody } {
    return (
		err instanceof HttpErrorResponse && err.status === 409 && typeof err.error?.message === 'string'
	);
}

function getFieldByKey<T>(field: FieldTree<T, string | number, 'writable'>, key: string) {
	const target = (field as Record<string, unknown>)[key] as
		| FieldTree<unknown, string | number, 'writable'>
		| undefined;
	return (target);
}

export function mapZodErrorsToFieldTree<T>(body: ZodErrorBody, field: FieldTree<T, string | number, 'writable'>) {
	const fieldErrors: ValidationError.WithOptionalFieldTree[] = [];
	const bannerErrors: string[] = [...body.formErrors];

	for (const [dtoKey, messages] of Object.entries(body.errors)) {
		const target = getFieldByKey(field, dtoKey);

		if (target) {
			messages.forEach((message) => fieldErrors.push({ fieldTree: target, kind: 'server', message }));
		}
		else {
			bannerErrors.push(...messages);
		}
	}

	return { fieldErrors, bannerErrors };
}

export function mapAuthErrorToBanner(body: AuthErrorBody) {
	const fieldErrors: ValidationError.WithOptionalFieldTree[] = [];
	
    return { fieldErrors, bannerErrors: [body.message] };
}
// Same limits as the backend (backend/services/shared/src/validation/field-schemas.ts), checked before sending.

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 15;
export const USERNAME_PATTERN = /^[a-zA-Z0-9_-]+$/;

export const EMAIL_MAX_LENGTH = 320;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,128}$/;

// Group and object names (checked after trim, like the backend)
export const NAME_MAX_LENGTH = 30;
export const NAME_PATTERN = /^[a-zA-Z0-9 ]+$/;

export const DESCRIPTION_MAX_LENGTH = 500;

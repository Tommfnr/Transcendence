// This helper flattens a string so a search compares only the letters: case and accents are dropped, and surrounding spaces are trimmed. "Télé" and "  tele " both become "tele".

export function normalizeForSearch(value: string): string {
	return value
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase()
		.trim();
}

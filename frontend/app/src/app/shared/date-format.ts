// This helper formats dates for display: how long ago something happened ("2h ago") and a from → to range ("17/05 → 18/05").

function formatDayMonth(dateIso: string): string {
	return (new Date(dateIso).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }));
}

export function formatTimeAgo(dateIso: string): string {
	const hours = Math.floor((Date.now() - new Date(dateIso).getTime()) / 3_600_000);

	if (hours < 1)
		return ('less than 1h ago');
	if (hours < 24)
		return (`${hours}h ago`);
	return (`${Math.floor(hours / 24)}d ago`);
}

export function formatDateRange(fromIso: string, toIso: string): string {
	return (`${formatDayMonth(fromIso)} → ${formatDayMonth(toIso)}`);
}

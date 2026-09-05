const pictures = new Set([
	'chair-ergo',
	'coffee-machine',
	'ficus',
	'lamp-arc',
	'monitor-2',
	'monstera',
	'poster-launch',
	'poster-metrics',
	'rug-round',
	'bone'
]);

export const picture = (slug: string) =>
	pictures.has(slug) ? `/img/items/${slug}.webp` : undefined;

export function describeEffect(effect: unknown): string {
	const e = (effect ?? {}) as { speed?: number; reward?: number };
	const parts: string[] = [];
	if (e.speed) parts.push(`заказы на ${Math.round(e.speed * 100)}% быстрее`);
	if (e.reward) parts.push(`награда +${Math.round(e.reward * 100)}%`);
	return parts.join(' · ');
}

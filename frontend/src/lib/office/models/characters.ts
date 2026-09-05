export const CHARACTER_VARIANTS = [
	'male-a',
	'male-b',
	'male-c',
	'male-d',
	'male-e',
	'male-f',
	'female-a',
	'female-b',
	'female-c',
	'female-d',
	'female-e',
	'female-f'
] as const;

export type CharacterVariant = (typeof CHARACTER_VARIANTS)[number];

const BY_NAME: Record<string, CharacterVariant> = {
	Лена: 'female-a',
	Макс: 'male-c',
	Даша: 'female-c',
	Тимур: 'male-d',
	Оля: 'female-e',
	Артём: 'male-e'
};

function hash(text: string): number {
	let h = 2166136261;
	for (let i = 0; i < text.length; i++) {
		h ^= text.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}

export function characterFor(name: string, isPlayer: boolean): CharacterVariant {
	if (!isPlayer && BY_NAME[name]) return BY_NAME[name];
	return CHARACTER_VARIANTS[hash(name) % CHARACTER_VARIANTS.length];
}

export function characterUrl(variant: CharacterVariant): string {
	return `/models/char-${variant}.glb`;
}

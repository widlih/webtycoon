export const HEX_SPACING = 3.6;

export const DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
	[1, 0],
	[1, -1],
	[0, -1],
	[-1, 0],
	[-1, 1],
	[0, 1]
];

export function hexKey(q: number, r: number): string {
	return `${q},${r}`;
}

export function hexDistance(q: number, r: number): number {
	return (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2;
}

export function neighbors(q: number, r: number): Array<{ q: number; r: number }> {
	return DIRECTIONS.map(([dq, dr]) => ({ q: q + dq, r: r + dr }));
}

export function radiusForCapacity(capacity: number): number {
	if (capacity > 12) return 3;
	if (capacity > 5) return 2;
	return 1;
}

export function hexesWithinRadius(radius: number): Array<{ q: number; r: number }> {
	const result: Array<{ q: number; r: number }> = [];
	for (let q = -radius; q <= radius; q++) {
		for (let r = -radius; r <= radius; r++) {
			if (hexDistance(q, r) <= radius) result.push({ q, r });
		}
	}
	return result;
}

export function hexToWorld(q: number, r: number, spacing = HEX_SPACING): { x: number; z: number } {
	return { x: spacing * Math.sqrt(3) * (q + r / 2), z: spacing * 1.5 * r };
}

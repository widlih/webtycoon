export const PRODUCTS = ['rusender', 'ucoz', 'webask'] as const;
export type Product = (typeof PRODUCTS)[number];

export const PRODUCT_TITLES: Record<Product, string> = {
	rusender: 'Рассылки',
	ucoz: 'Сайты',
	webask: 'Опросы'
};

export const LEVEL_XP = [0, 100, 250, 500, 900, 1400, 2000, 2800, 3800, 5000];

export function levelForXp(xp: number): number {
	let level = 1;
	for (let i = 1; i < LEVEL_XP.length; i++) {
		if (xp >= LEVEL_XP[i]) level = i + 1;
	}
	return level;
}

export const MAX_SKILL_LEVEL = 5;

export const OFFICE_TIERS = [
	{ tier: 1, title: 'Гараж', hexCapacity: 7, slotsPerRoom: 3, price: 0 },
	{ tier: 2, title: 'Офис', hexCapacity: 19, slotsPerRoom: 5, price: 6000 },
	{ tier: 3, title: 'Кампус', hexCapacity: 37, slotsPerRoom: 7, price: 30000 }
] as const;

export const DESK_POSITION = { x: 0, z: 0 } as const;

export const ROOM_SLOTS = [
	{ id: 's1', x: 1.2, z: 0.6, rot: 0 },
	{ id: 's2', x: 1.9, z: -1.9, rot: 0 },
	{ id: 's3', x: 0, z: -2.45, rot: 0 },
	{ id: 's4', x: -1.8, z: 1.3, rot: 0.6 },
	{ id: 's5', x: -1.9, z: -1.9, rot: 0 },
	{ id: 's6', x: 0, z: 1.1, rot: 0 },
	{ id: 's7', x: -1.2, z: -0.8, rot: 0 }
] as const;

export const ROOM_BASE_PRICE = 500;
export const ROOM_PRICE_GROWTH = 1.6;
export const SKILL_SPEED_BONUS = 0.1;
export const SKILL_REWARD_BONUS = 0.1;
export const QUIZ_QUESTIONS_PER_RUN = 3;
export const QUIZ_PASS_THRESHOLD = 3;
export const DAILY_BOARD = 'daily_xp';
export const TIMEZONE_OFFSET_MS = 3 * 60 * 60 * 1000;

export function roomPrice(openedRooms: number): number {
	return Math.round(ROOM_BASE_PRICE * Math.pow(ROOM_PRICE_GROWTH, openedRooms - 1));
}

export function periodKey(now: number): string {
	return new Date(now + TIMEZONE_OFFSET_MS).toISOString().slice(0, 10);
}

export const QUIZ_BONUS_MULTIPLIER = 1.25;
export const MAX_ITEM_SPEED_BONUS = 0.5;

export const DAILY_PRIZES = [500, 300, 150];
export const LEADERBOARD_SIZE = 20;

export const ENERGY_MAX = 8;
export const ENERGY_REGEN_MS = 30 * 60 * 1000;
export const QUIZ_ENERGY_COST = 1;
export const ENERGY_REFILL_PREMIUM = 5;
export const DAILY_PREMIUM_PRIZES = [10, 6, 3];
export const BOARDS = { day: 'daily_xp', week: 'weekly_xp', month: 'monthly_xp' } as const;
export type BoardPeriod = keyof typeof BOARDS;

export function weekKey(now: number): string {
	const d = new Date(now + TIMEZONE_OFFSET_MS);
	const day = (d.getUTCDay() + 6) % 7;
	d.setUTCDate(d.getUTCDate() - day + 3);
	const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
	const week =
		1 +
		Math.round(
			((d.getTime() - firstThursday.getTime()) / 86400000 -
				3 +
				((firstThursday.getUTCDay() + 6) % 7)) /
				7
		);
	return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function monthKey(now: number): string {
	return new Date(now + TIMEZONE_OFFSET_MS).toISOString().slice(0, 7);
}

export function periodKeyFor(period: BoardPeriod, now: number): string {
	if (period === 'week') return weekKey(now);
	if (period === 'month') return monthKey(now);
	return periodKey(now);
}

export const FREELANCER_SPEED = 0.5;
export const BONUS_MULTIPLIER = 2;

export const OFFER_SLOTS_MAX = 5;
export const OFFER_SLOTS_START = 2;
export const OFFER_SLOT_PRICES = [0, 0, 400, 900, 2000];
export const OFFER_COOLDOWN_MS = 4 * 60 * 1000;

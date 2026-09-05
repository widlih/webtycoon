/** Награда за день серии. Серия идёт по кругу: после 7-го дня снова 1-й. */
export type DailyReward = {
	coins?: number;
	xp?: number;
	premium?: number;
	boxes?: number;
	/** Восстановить энергию до максимума */
	energy?: 'full';
};

export const DAILY_REWARDS: DailyReward[] = [
	{ coins: 150 },
	{ coins: 250, xp: 50 },
	{ energy: 'full', coins: 100 },
	{ premium: 3 },
	{ coins: 500, xp: 100 },
	{ premium: 5 },
	{ boxes: 1, coins: 1000 }
];

export const DAILY_CYCLE = DAILY_REWARDS.length;

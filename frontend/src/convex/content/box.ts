export const BOX_PRICE_PREMIUM = 5;
export const BOX_DAILY_LIMIT = 5;

export type BoxDrop =
	| { kind: 'coins'; min: number; max: number }
	| { kind: 'xp'; min: number; max: number }
	| { kind: 'energy'; min: number; max: number }
	| { kind: 'premium'; min: number; max: number }
	| { kind: 'boost'; boost: 'bonus' | 'freelancer' }
	| { kind: 'item' }
	| { kind: 'coupon' };

export type BoxDropEntry = {
	id: string;
	weight: number;
	title: string;
	text: string;
	drop: BoxDrop;
};

export const BOX_DROPS: BoxDropEntry[] = [
	{
		id: 'coins',
		weight: 30,
		title: '300–700 монет',
		text: 'На комнаты, сотрудников и предметы',
		drop: { kind: 'coins', min: 300, max: 700 }
	},
	{
		id: 'energy',
		weight: 18,
		title: '2–5 энергии',
		text: 'Чтобы закрывать заказы квизом',
		drop: { kind: 'energy', min: 2, max: 5 }
	},
	{
		id: 'xp',
		weight: 20,
		title: '150–400 опыта',
		text: 'Быстрее к новому уровню',
		drop: { kind: 'xp', min: 150, max: 400 }
	},
	{
		id: 'bonus',
		weight: 8,
		title: 'Премия ×2',
		text: 'Следующий закрытый заказ платит вдвое',
		drop: { kind: 'boost', boost: 'bonus' }
	},
	{
		id: 'freelancer',
		weight: 6,
		title: 'Фрилансер на час',
		text: 'Все комнаты работают в два раза быстрее',
		drop: { kind: 'boost', boost: 'freelancer' }
	},
	{
		id: 'item',
		weight: 8,
		title: 'Предмет для офиса',
		text: 'Случайный предмет из магазина в инвентарь',
		drop: { kind: 'item' }
	},
	{
		id: 'coupon',
		weight: 5,
		title: 'Купон на скидку',
		text: 'Реальная скидка 10–25% на один из продуктов',
		drop: { kind: 'coupon' }
	},
	{
		id: 'premium',
		weight: 5,
		title: '3–10 премиум',
		text: 'Возврат премиум-валюты',
		drop: { kind: 'premium', min: 3, max: 10 }
	}
];

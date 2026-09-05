export const boosts = [
	{
		slug: 'energy-drink',
		title: 'Энергетик',
		description: '+4 энергии сразу',
		kind: 'energy' as const,
		value: 4,
		price: 200,
		order: 1,
		active: true
	},
	{
		slug: 'overtime',
		title: 'Овертайм',
		description: 'Оставшееся время всех текущих заказов сокращается вдвое',
		kind: 'overtime' as const,
		value: 0.5,
		price: 250,
		order: 2,
		active: true
	},
	{
		slug: 'freelancer',
		title: 'Фрилансер',
		description: 'Час все комнаты работают в два раза быстрее',
		kind: 'freelancer' as const,
		value: 0.5,
		durationMin: 60,
		price: 600,
		order: 3,
		active: true
	},
	{
		slug: 'bonus',
		title: 'Премия',
		description: 'Следующий закрытый заказ платит вдвое',
		kind: 'bonus' as const,
		value: 2,
		price: 400,
		order: 4,
		active: true
	}
];

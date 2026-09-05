export const achievements = [
	{
		slug: 'first-order',
		title: 'Первый заказ',
		description: 'Закрыть первый заказ клиента',
		rule: { event: 'order.completed', count: 1 },
		reward: { premium: 1 },
		order: 1,
		active: true
	},
	{
		slug: 'ten-orders',
		title: 'Десять заказов',
		description: 'Закрыть десять заказов',
		rule: { event: 'order.completed', count: 10 },
		reward: { premium: 3 },
		order: 2,
		active: true
	},
	{
		slug: 'first-lesson',
		title: 'Первый урок',
		description: 'Пройти первый урок',
		rule: { event: 'lesson.completed', count: 1 },
		reward: { premium: 1 },
		order: 3,
		active: true
	},
	{
		slug: 'rusender-master',
		title: 'Мастер рассылок',
		description: 'Пройти все уроки по рассылкам',
		rule: { event: 'lesson.completed', count: 5 },
		reward: { premium: 5 },
		order: 4,
		active: true
	},
	{
		slug: 'second-room',
		title: 'Расширение',
		description: 'Открыть вторую комнату',
		rule: { event: 'room.opened', count: 1 },
		reward: { premium: 1 },
		order: 5,
		active: true
	},
	{
		slug: 'full-garage',
		title: 'Полный гараж',
		description: 'Занять все гексы первого офиса',
		rule: { event: 'room.opened', count: 6 },
		reward: { premium: 3 },
		order: 6,
		active: true
	},
	{
		slug: 'first-coupon',
		title: 'Первый купон',
		description: 'Купить первый купон',
		rule: { event: 'coupon.bought', count: 1 },
		reward: { premium: 1 },
		order: 7,
		active: true
	}
];

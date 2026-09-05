export const quests = [
	{
		slug: 'daily-orders-3',
		title: 'Закрыть три заказа',
		kind: 'ingame',
		rule: { event: 'order.completed', count: 3 },
		reward: { coins: 150, xp: 40 },
		period: 'daily',
		active: true,
		order: 1
	},
	{
		slug: 'daily-quiz',
		title: 'Помочь сотруднику квизом',
		kind: 'ingame',
		rule: { event: 'quiz.passed', count: 1 },
		reward: { coins: 80, xp: 20 },
		period: 'daily',
		active: true,
		order: 2
	},
	{
		slug: 'daily-lesson',
		title: 'Пройти урок',
		kind: 'ingame',
		rule: { event: 'lesson.completed', count: 1 },
		reward: { coins: 100, xp: 30 },
		period: 'daily',
		active: true,
		order: 3
	},
	{
		slug: 'weekly-orders-15',
		title: 'Закрыть пятнадцать заказов',
		kind: 'ingame',
		rule: { event: 'order.completed', count: 15 },
		reward: { coins: 600, xp: 150 },
		period: 'weekly',
		active: true,
		order: 10
	},
	{
		slug: 'weekly-quizzes-5',
		title: 'Пройти пять квизов',
		kind: 'ingame',
		rule: { event: 'quiz.passed', count: 5 },
		reward: { coins: 350, xp: 90 },
		period: 'weekly',
		active: true,
		order: 11
	},
	{
		slug: 'weekly-lessons-3',
		title: 'Пройти три урока',
		kind: 'ingame',
		rule: { event: 'lesson.completed', count: 3 },
		reward: { coins: 400, xp: 100 },
		period: 'weekly',
		active: true,
		order: 12
	},
	{
		slug: 'first-lesson',
		title: 'Пройти первый урок',
		kind: 'ingame',
		rule: { event: 'lesson.completed', count: 1 },
		reward: { coins: 200, xp: 50 },
		period: 'once',
		active: true,
		order: 20
	},
	{
		slug: 'second-room',
		title: 'Открыть вторую комнату',
		kind: 'ingame',
		rule: { event: 'room.opened', count: 1 },
		reward: { coins: 300, xp: 60 },
		period: 'once',
		active: true,
		order: 21
	},
	{
		slug: 'rusender-register',
		title: 'Зарегистрироваться в RuSender',
		kind: 'external',
		rule: { source: 'rusender', action: 'registered' },
		reward: { coins: 1000, xp: 200 },
		period: 'once',
		active: true,
		order: 22
	}
];

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
		active: false,
		order: 22
	},
	{
		slug: 'visit-rusender-builder',
		title: 'Посмотреть конструктор писем RuSender',
		kind: 'external',
		rule: {
			action: 'visit',
			url: 'https://rusender.ru/features/email/builder/',
			frame: true,
			seconds: 20
		},
		reward: { coins: 40, xp: 10 },
		period: 'once',
		active: true,
		order: 30
	},
	{
		slug: 'visit-rusender-pricing',
		title: 'Изучить тарифы RuSender',
		kind: 'external',
		rule: { action: 'visit', url: 'https://rusender.ru/pricing/', frame: true, seconds: 20 },
		reward: { coins: 40, xp: 10 },
		period: 'once',
		active: true,
		order: 31
	},
	{
		slug: 'visit-rusender-segmentation',
		title: 'Прочитать статью о сегментации базы',
		kind: 'external',
		rule: {
			action: 'visit',
			url: 'https://rusender.ru/blog/segmentacziya-bazy-pochtovyh-rassylok-raczionalnyj-podhod/',
			frame: true,
			seconds: 45
		},
		reward: { coins: 60, xp: 15 },
		period: 'once',
		active: true,
		order: 32
	},
	{
		slug: 'visit-ucoz-tour',
		title: 'Пройти тур по uCoz',
		kind: 'external',
		rule: { action: 'visit', url: 'https://www.ucoz.ru/tour/', frame: true, seconds: 20 },
		reward: { coins: 40, xp: 10 },
		period: 'once',
		active: true,
		order: 33
	},
	{
		slug: 'visit-ucoz-success',
		title: 'Посмотреть примеры сайтов на uCoz',
		kind: 'external',
		rule: { action: 'visit', url: 'https://www.ucoz.ru/success/', frame: true, seconds: 20 },
		reward: { coins: 40, xp: 10 },
		period: 'once',
		active: true,
		order: 34
	},
	{
		slug: 'visit-webask-templates',
		title: 'Посмотреть шаблоны опросов WebAsk',
		kind: 'external',
		rule: { action: 'visit', url: 'https://webask.io/templates', frame: false, seconds: 20 },
		reward: { coins: 40, xp: 10 },
		period: 'once',
		active: true,
		order: 35
	},
	{
		slug: 'watch-rusender-features',
		title: 'Узнать, что умеет RuSender',
		kind: 'external',
		rule: {
			action: 'watch',
			seconds: 24,
			slides: [
				{
					title: 'Конструктор писем',
					text: 'Собирайте письмо из блоков без вёрстки: текст, картинки, кнопки, товары. Адаптивно на телефоне.'
				},
				{
					title: 'Формы подписки',
					text: 'Встраиваемые и всплывающие формы собирают базу прямо с вашего сайта.'
				},
				{
					title: 'Цепочки писем',
					text: 'Приветственные серии и напоминания уходят сами по заданному сценарию.'
				},
				{
					title: 'Аналитика',
					text: 'Открытия, клики, отписки и карта кликов по каждому письму.'
				}
			]
		},
		reward: { coins: 60, xp: 20 },
		period: 'once',
		active: true,
		order: 36
	},
	{
		slug: 'newsletter',
		title: 'Подписаться на рассылку WebTycoon',
		kind: 'external',
		rule: { action: 'newsletter' },
		reward: { coins: 150, xp: 40 },
		period: 'once',
		active: true,
		order: 37
	},
	{
		slug: 'invite-friend',
		title: 'Пригласить друга',
		kind: 'external',
		rule: { action: 'invite', event: 'referral.completed', count: 1 },
		reward: { coins: 500, xp: 100 },
		period: 'once',
		active: true,
		order: 38
	},
	{
		slug: 'telegram-subscribe',
		title: 'Подписаться на Telegram-канал',
		kind: 'external',
		rule: { action: 'telegram' },
		reward: { coins: 200, xp: 50 },
		period: 'once',
		active: false,
		order: 39
	}
];

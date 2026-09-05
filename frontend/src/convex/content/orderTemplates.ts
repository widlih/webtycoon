type Template = {
	slug: string;
	product: string;
	title: string;
	minSkill: number;
	durationMin: number;
	reward: { coins: number; xp: number };
	active: boolean;
};

const tiers = [
	{ minSkill: 1, durationMin: 6, coins: 90, xp: 25 },
	{ minSkill: 1, durationMin: 8, coins: 120, xp: 30 },
	{ minSkill: 2, durationMin: 10, coins: 170, xp: 45 },
	{ minSkill: 2, durationMin: 12, coins: 200, xp: 50 },
	{ minSkill: 3, durationMin: 15, coins: 280, xp: 70 },
	{ minSkill: 3, durationMin: 18, coins: 340, xp: 80 },
	{ minSkill: 4, durationMin: 22, coins: 450, xp: 105 },
	{ minSkill: 4, durationMin: 25, coins: 520, xp: 120 },
	{ minSkill: 5, durationMin: 30, coins: 650, xp: 150 },
	{ minSkill: 5, durationMin: 35, coins: 780, xp: 180 }
];

const titles: Record<string, string[]> = {
	rusender: [
		'Приветственное письмо',
		'Напоминание о записи',
		'Акционная рассылка',
		'Дайджест новинок',
		'Рассылка по сегментам',
		'Реактивация клиентов',
		'Автоцепочка писем',
		'Брошенная корзина',
		'A/B-тест темы',
		'Триггерная рассылка'
	],
	ucoz: [
		'Сайт-визитка',
		'Лендинг клиники',
		'Сайт-каталог',
		'Страница записи',
		'Сайт с заявкой',
		'Многостраничный сайт',
		'Интернет-магазин',
		'Портал с кабинетом',
		'Сайт с оплатой',
		'Мультиязычный сайт'
	],
	webask: [
		'Опрос клиентов',
		'Форма обратной связи',
		'Анкета участника',
		'Опрос гостей',
		'NPS-опрос',
		'Тест по безопасности',
		'Опрос с ветвлением',
		'Исследование аудитории',
		'Анкета для найма',
		'Опрос с квотами'
	]
};

const prefixes: Record<string, string> = { rusender: 'rs', ucoz: 'uc', webask: 'wa' };

export const orderTemplates: Template[] = Object.entries(titles).flatMap(([product, list]) =>
	list.map((title, i) => ({
		slug: `${prefixes[product]}-${String(i + 1).padStart(2, '0')}`,
		product,
		title,
		minSkill: tiers[i].minSkill,
		durationMin: tiers[i].durationMin,
		reward: { coins: tiers[i].coins, xp: tiers[i].xp },
		active: true
	}))
);

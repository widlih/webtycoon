import type { Icon as IconType } from '@lucide/svelte';
import {
	Building2,
	Coins,
	Gem,
	GraduationCap,
	Hammer,
	ListChecks,
	Mail,
	MessageCircleQuestion,
	Package,
	Rocket,
	ShoppingBag,
	Star,
	Ticket,
	Trophy,
	UserRound,
	Users,
	Zap
} from '@lucide/svelte';
import {
	ENERGY_REGEN_MS,
	LEADERBOARD_PRIZES,
	LEADERBOARD_SIZE,
	MAX_SKILL_LEVEL,
	QUIZ_BONUS_MULTIPLIER,
	QUIZ_ENERGY_COST
} from '../../convex/model/constants';

export type OnboardingScreen =
	'office' | 'lessons' | 'quests' | 'market' | 'leaderboard' | 'profile';

export type CoinColor = 'violet' | 'yellow' | 'silver' | 'blue' | 'ink';

export type Coin = {
	icon: typeof IconType;
	color: CoinColor;
	/** Диаметр в px */
	size: number;
	/** Позиция центра в % от области иллюстрации */
	x: number;
	y: number;
	/** Наклон в градусах */
	rot?: number;
};

export type Slide = {
	title: string;
	text: string;
	art: Coin[];
	cta?: string;
};

const bonus = String(QUIZ_BONUS_MULTIPLIER).replace('.', ',');
const regenMin = Math.round(ENERGY_REGEN_MS / 60000);
const weekTop = LEADERBOARD_PRIZES.week[0];

/** Экран → путь. Подсказка показывается только при точном совпадении пути. */
export const SCREEN_PATHS: Record<OnboardingScreen, string> = {
	office: '/app',
	lessons: '/app/lessons',
	quests: '/app/quests',
	market: '/app/market',
	leaderboard: '/app/leaderboard',
	profile: '/app/profile'
};

export const SLIDES: Record<OnboardingScreen, Slide[]> = {
	office: [
		{
			title: 'Как играть',
			text: 'Это твоя веб-студия. Бери заказы из ленты внизу и назначай их в комнату с сотрудником — он выполнит заказ по таймеру. За каждый заказ получаешь монеты и XP.',
			art: [
				{ icon: Building2, color: 'violet', size: 118, x: 42, y: 46, rot: -12 },
				{ icon: Coins, color: 'yellow', size: 70, x: 74, y: 26, rot: 14 },
				{ icon: Star, color: 'silver', size: 62, x: 70, y: 72, rot: -8 }
			],
			cta: 'Дальше'
		},
		{
			title: 'Помоги сотруднику',
			text: `Не хочешь ждать? Нажми «Помочь»: ответь на три вопроса или сделай заказ сам в мини-игре. Заказ закроется сразу с бонусом ×${bonus}. Стоит ${QUIZ_ENERGY_COST} энергии, она восстанавливается по 1 каждые ${regenMin} минут.`,
			art: [
				{ icon: MessageCircleQuestion, color: 'blue', size: 104, x: 36, y: 40, rot: -10 },
				{ icon: Hammer, color: 'violet', size: 84, x: 68, y: 64, rot: 16 },
				{ icon: Zap, color: 'yellow', size: 58, x: 76, y: 24, rot: -6 }
			],
			cta: 'Дальше'
		},
		{
			title: 'Валюты',
			text: 'Монеты — за заказы, уроки и задания, на них покупаешь комнаты и сотрудников. Премиум — за топ-3 рейтинга и ачивки, меняется на купоны. Боксы с призами открываются бесплатно в маркете.',
			art: [
				{ icon: Coins, color: 'yellow', size: 100, x: 34, y: 42, rot: -14 },
				{ icon: Gem, color: 'violet', size: 86, x: 70, y: 34, rot: 12 },
				{ icon: Package, color: 'silver', size: 74, x: 60, y: 76, rot: -4 }
			],
			cta: 'Понятно'
		}
	],
	lessons: [
		{
			title: 'Обучение',
			text: 'Уроки по реальным сервисам: рассылки в RuSender, сайты в uCoz и опросы в WebAsk. В каждом шаге нужно действие — клик, выбор, перетаскивание или ввод.',
			art: [
				{ icon: GraduationCap, color: 'violet', size: 116, x: 40, y: 46, rot: -10 },
				{ icon: Mail, color: 'blue', size: 66, x: 74, y: 28, rot: 12 },
				{ icon: Star, color: 'yellow', size: 58, x: 72, y: 72, rot: -8 }
			],
			cta: 'Дальше'
		},
		{
			title: 'Прокачка отделов',
			text: `Пройденный урок даёт +1 уровень навыка, максимум ${MAX_SKILL_LEVEL}. Чем выше навык, тем быстрее сотрудники закрывают заказы этого продукта и тем больше награда. Уроки открываются по порядку.`,
			art: [
				{ icon: Rocket, color: 'yellow', size: 108, x: 38, y: 44, rot: -16 },
				{ icon: Star, color: 'violet', size: 78, x: 72, y: 32, rot: 10 },
				{ icon: Star, color: 'silver', size: 52, x: 68, y: 74, rot: -12 }
			],
			cta: 'Класс'
		}
	],
	quests: [
		{
			title: 'Задания',
			text: 'Награда за реальные действия: подпишись на канал, зарегистрируйся в сервисе или пригласи друга. Выполни задание, вернись в игру и забери награду.',
			art: [
				{ icon: ListChecks, color: 'violet', size: 112, x: 40, y: 46, rot: -8 },
				{ icon: Coins, color: 'yellow', size: 70, x: 74, y: 28, rot: 14 },
				{ icon: Gem, color: 'silver', size: 58, x: 72, y: 72, rot: -10 }
			],
			cta: 'Дальше'
		},
		{
			title: 'Забирай награды',
			text: 'Готовые задания отмечаются точкой в меню «Задания». Часть заданий можно выполнять повторно — следи за таймером и возвращайся, когда задание снова откроется.',
			art: [
				{ icon: Coins, color: 'yellow', size: 104, x: 36, y: 42, rot: -12 },
				{ icon: Star, color: 'violet', size: 82, x: 70, y: 36, rot: 10 },
				{ icon: Zap, color: 'blue', size: 56, x: 62, y: 76, rot: -6 }
			],
			cta: 'Понятно'
		}
	],
	market: [
		{
			title: 'Маркет',
			text: 'Здесь растёт студия: офис побольше, новые комнаты, сотрудники и ускорители. Больше комнат с сотрудниками — больше заказов одновременно. Нанятый сотрудник появится в инвентаре на сцене офиса.',
			art: [
				{ icon: ShoppingBag, color: 'violet', size: 114, x: 40, y: 46, rot: -10 },
				{ icon: Users, color: 'blue', size: 72, x: 74, y: 28, rot: 12 },
				{ icon: Rocket, color: 'yellow', size: 60, x: 72, y: 72, rot: -14 }
			],
			cta: 'Дальше'
		},
		{
			title: 'Купоны и боксы',
			text: 'Во вкладке «Купоны» меняй премиум на скидки для реальных продуктов: сайты, рассылки, опросы. Боксы из рейтинга открываются бесплатно во вкладке «Бокс» — внутри монеты, премиум и ускорители.',
			art: [
				{ icon: Ticket, color: 'yellow', size: 104, x: 36, y: 42, rot: -14 },
				{ icon: Package, color: 'silver', size: 84, x: 70, y: 36, rot: 8 },
				{ icon: Gem, color: 'violet', size: 56, x: 64, y: 76, rot: -8 }
			],
			cta: 'Круто'
		}
	],
	leaderboard: [
		{
			title: 'Рейтинг',
			text: `Очки — это XP, заработанный за день, неделю или месяц. В таблице топ-${LEADERBOARD_SIZE}, а первые три места получают монеты, премиум и боксы: за неделю до ${weekTop.coins} монет и ${weekTop.boxes} боксов. Потом таблица обнуляется.`,
			art: [
				{ icon: Trophy, color: 'yellow', size: 116, x: 40, y: 46, rot: -8 },
				{ icon: Star, color: 'violet', size: 72, x: 74, y: 28, rot: 14 },
				{ icon: Package, color: 'silver', size: 58, x: 72, y: 72, rot: -10 }
			],
			cta: 'Круто'
		}
	],
	profile: [
		{
			title: 'Профиль',
			text: 'Уровень растёт вместе с XP. Здесь видны навыки по каждому продукту, ачивки с наградами в премиуме и энергия для подсказок. Подсказки по экранам можно показать заново кнопкой внизу.',
			art: [
				{ icon: UserRound, color: 'violet', size: 112, x: 40, y: 46, rot: -8 },
				{ icon: Star, color: 'yellow', size: 70, x: 74, y: 28, rot: 12 },
				{ icon: Zap, color: 'blue', size: 56, x: 72, y: 72, rot: -10 }
			],
			cta: 'Понятно'
		}
	]
};

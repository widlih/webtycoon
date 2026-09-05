import type { LessonContent } from '../model/lessonSteps';

export const lessons: Array<LessonContent & { active: boolean }> = [
	{
		slug: 'rs-first-campaign',
		product: 'rusender',
		order: 1,
		title: 'Первая рассылка',
		reward: { coins: 150, xp: 60 },
		active: true,
		steps: [
			{
				type: 'click',
				widget: 'campaignList',
				prompt: 'Создайте новую рассылку.',
				target: 'create',
				hint: 'Кнопка создания находится над списком кампаний.'
			},
			{
				type: 'input',
				widget: 'campaignHeader',
				prompt: 'Введите тему письма для приветственной рассылки кофейни.',
				field: 'subject',
				minLength: 10,
				maxLength: 60,
				mustExclude: ['!!!', 'БЕСПЛАТНО'],
				hint: 'Коротко, без капса и восклицательных знаков.'
			},
			{
				type: 'drag',
				widget: 'blockEditor',
				prompt: 'Перетащите блок с кнопкой в письмо под текст.',
				item: 'button',
				zone: 'afterText',
				hint: 'Кнопка ведёт читателя к действию.'
			},
			{
				type: 'choose',
				widget: 'audiencePicker',
				prompt: 'Выберите список получателей для приветственного письма.',
				options: ['Все контакты', 'Новые подписчики за 7 дней', 'Отписавшиеся'],
				answer: 1,
				hint: 'Приветствуем тех, кто только что подписался.'
			},
			{
				type: 'choose',
				widget: 'sendDialog',
				prompt: 'Как отправить это письмо?',
				options: ['Сейчас', 'Запланировать на утро вторника'],
				answer: 1,
				hint: 'Утро буднего дня даёт больше открытий.'
			}
		]
	}
];

import type { LessonContent } from '../model/lessonSteps';

type Lesson = LessonContent & { active: boolean };

const rusender: Lesson[] = [
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
				prompt: 'Выберите, как отправить это письмо.',
				options: ['Сейчас', 'Запланировать на утро вторника'],
				answer: 1,
				hint: 'Утро буднего дня даёт больше открытий.'
			}
		]
	},
	{
		slug: 'rs-segments',
		product: 'rusender',
		order: 2,
		title: 'Сегменты аудитории',
		reward: { coins: 180, xp: 70 },
		active: true,
		steps: [
			{
				type: 'click',
				widget: 'campaignList',
				prompt: 'Сегменты живут в разделе с контактами. Откройте его.',
				target: 'contacts',
				hint: 'Раздел «Контакты» рядом с шаблонами.'
			},
			{
				type: 'choose',
				widget: 'segmentBuilder',
				prompt:
					'Нужно выделить подписчиков, которые давно не читают письма. Какое условие подойдёт?',
				options: [
					'Активность в рассылке: не открывал',
					'Email: содержит «@»',
					'Дата добавления: позже вчера'
				],
				answer: 0,
				hint: 'Сегмент строится по действиям подписчика в прошлых рассылках.'
			},
			{
				type: 'choose',
				widget: 'segmentBuilder',
				prompt: 'Сегмент «новые подписчики И из списка “Москва”». Какой оператор выбрать?',
				options: ['Все условия одновременно', 'Хотя бы одно из условий'],
				answer: 0,
				hint: 'Союз «и» означает, что должны выполняться оба условия.'
			},
			{
				type: 'choose',
				widget: 'audiencePicker',
				prompt: 'Выберите, кому отправить письмо «Мы скучаем» со скидкой.',
				options: ['Все контакты', 'Сегмент «Не открывали 90 дней»', 'Отписавшиеся'],
				answer: 1,
				hint: 'Реактивация нужна только тем, кто перестал читать.'
			},
			{
				type: 'input',
				widget: 'campaignHeader',
				prompt: 'Напишите тему письма для реактивации. Без давления и капса.',
				field: 'subject',
				minLength: 10,
				maxLength: 60,
				mustExclude: ['!!!', 'СРОЧНО', 'БЕСПЛАТНО'],
				hint: 'Например: «Мы соскучились. Вот подарок к вашему возвращению».'
			}
		]
	},
	{
		slug: 'rs-automation',
		product: 'rusender',
		order: 3,
		title: 'Приветственная цепочка',
		reward: { coins: 200, xp: 80 },
		active: true,
		steps: [
			{
				type: 'order',
				widget: 'orderList',
				prompt: 'Соберите цепочку писем для нового подписчика.',
				items: [
					'Событие: подписка через форму на сайте',
					'Задержка: 10 минут',
					'Письмо 1: приветствие и подарок',
					'Условие: открыл письмо 1?',
					'Письмо 2: подборка новинок'
				],
				correct: [0, 1, 2, 3, 4],
				hint: 'Цепочка стартует с события, затем задержка, письмо, проверка условия, следующее письмо.'
			},
			{
				type: 'choose',
				widget: 'sendDialog',
				prompt: 'Выберите, когда уходит письмо из цепочки.',
				options: ['Сразу всей базе', 'Автоматически по событию для каждого подписчика'],
				answer: 1,
				hint: 'Триггерное письмо отправляется каждому в его момент.'
			},
			{
				type: 'drag',
				widget: 'blockEditor',
				prompt: 'Добавьте кнопку «Забрать подарок» под текст первого письма.',
				item: 'button',
				zone: 'afterText',
				hint: 'Одно письмо, одно главное действие.'
			},
			{
				type: 'choose',
				widget: 'audiencePicker',
				prompt: 'Выберите, кто должен попадать в приветственную цепочку.',
				options: ['Все контакты', 'Новые подписчики за 7 дней', 'Отписавшиеся'],
				answer: 1,
				hint: 'Старым подписчикам приветствие не нужно.'
			}
		]
	},
	{
		slug: 'rs-ab-test',
		product: 'rusender',
		order: 4,
		title: 'A/B-тест темы',
		reward: { coins: 220, xp: 90 },
		active: true,
		steps: [
			{
				type: 'click',
				widget: 'campaignList',
				prompt: 'Создайте рассылку, тип «A/B-тестирование» выберете следующим шагом.',
				target: 'create',
				hint: 'Та же кнопка создания.'
			},
			{
				type: 'input',
				widget: 'campaignHeader',
				prompt: 'Напишите тему для варианта A: спокойную, с выгодой для читателя.',
				field: 'subject',
				minLength: 10,
				maxLength: 60,
				mustExclude: ['!!!', 'бесплатно', 'срочно'],
				hint: 'Вариант B будет с вопросом в теме. Сравним открытия.'
			},
			{
				type: 'choose',
				widget: 'sendDialog',
				prompt: 'Выберите минимальное число получателей для честного теста.',
				options: ['5 человек', '20 и больше'],
				answer: 1,
				hint: 'RuSender запускает A/B от 20 получателей, иначе разница случайна.'
			},
			{
				type: 'choose',
				widget: 'audiencePicker',
				prompt: 'Тест закончился, победил вариант A. Выберите, кому его отправить.',
				options: ['Всей оставшейся базе', 'Только тестовой группе', 'Отписавшимся'],
				answer: 0,
				hint: 'Смысл теста в том, чтобы остальным ушёл лучший вариант.'
			}
		]
	},
	{
		slug: 'rs-deliverability',
		product: 'rusender',
		order: 5,
		title: 'Доставляемость',
		reward: { coins: 250, xp: 100 },
		active: true,
		steps: [
			{
				type: 'choose',
				widget: 'sendDialog',
				prompt: 'Выберите адрес отправителя для рассылки кофейни.',
				options: ['zerno.coffee@gmail.com', 'news@zerno-coffee.ru на своём домене'],
				answer: 1,
				hint: 'Свой домен с записями SPF и DKIM не отправляет письма в спам.'
			},
			{
				type: 'choose',
				widget: 'segmentBuilder',
				prompt: 'Отметьте, каким контактам RuSender отправит рассылку.',
				options: [
					'Со статусами «Новый» и «Активный»',
					'Со статусами «Ошибка» и «Отписан»',
					'Всем без разбора'
				],
				answer: 0,
				hint: 'Отписанные и ошибочные адреса исключаются автоматически.'
			},
			{
				type: 'drag',
				widget: 'blockEditor',
				prompt: 'В подвале письма должна быть ссылка на отписку. Перетащите туда блок «Текст».',
				item: 'text',
				zone: 'text:footer',
				hint: 'Подвал в самом низу письма.'
			},
			{
				type: 'choose',
				widget: 'sendDialog',
				prompt: 'Первая рассылка по новой базе. Выберите, что произойдёт после нажатия «Отправить».',
				options: ['Уйдёт мгновенно', 'Может уйти на модерацию'],
				answer: 1,
				hint: 'Новые базы проверяются, проверенные отправляются автоматически.'
			}
		]
	}
];

const ucoz: Lesson[] = [
	{
		slug: 'uc-first-site',
		product: 'ucoz',
		order: 1,
		title: 'Первый сайт',
		reward: { coins: 150, xp: 60 },
		active: true,
		steps: [
			{
				type: 'click',
				widget: 'ucPanel',
				prompt: 'Сайт стоматологии создан. Откройте раздел с общими настройками.',
				target: 'settings',
				hint: 'Верхнее меню панели управления, первый пункт.'
			},
			{
				type: 'input',
				widget: 'ucSettings',
				prompt: 'Введите название сайта. Оно подставится в шаблон.',
				field: 'name',
				minLength: 5,
				maxLength: 40,
				hint: 'Например: Стоматология «Улыбка».'
			},
			{
				type: 'input',
				widget: 'ucSettings',
				prompt: 'Заполните Meta Description: одно-два предложения о клинике для поисковой выдачи.',
				field: 'description',
				minLength: 40,
				maxLength: 160,
				mustExclude: ['!!!'],
				hint: 'Что делаете, для кого, где. До 160 знаков.'
			},
			{
				type: 'click',
				widget: 'ucSettings',
				prompt: 'Сохраните изменения.',
				target: 'save',
				hint: 'Кнопка внизу формы.'
			},
			{
				type: 'choose',
				widget: 'ucDesign',
				prompt: 'Выберите дизайн, который корректно откроется на телефоне.',
				options: [
					'Шаблон №2301 · адаптивный, готовые блоки',
					'Шаблон №937 · фиксированная ширина для ПК',
					'Пустой каркас без стилей'
				],
				answer: 0,
				hint: 'Адаптивный шаблон подстраивается под любой экран.'
			}
		]
	},
	{
		slug: 'uc-modules',
		product: 'ucoz',
		order: 2,
		title: 'Модули сайта',
		reward: { coins: 180, xp: 70 },
		active: true,
		steps: [
			{
				type: 'click',
				widget: 'ucPanel',
				prompt: 'Клинике нужны заявки на приём. Включите модуль «Почтовые формы».',
				target: 'module:mailform',
				hint: 'Модуль в списке «Неактивные».'
			},
			{
				type: 'click',
				widget: 'ucPanel',
				prompt: 'Пациенты хотят оставлять отзывы. Включите подходящий модуль.',
				target: 'module:guestbook',
				hint: 'Отзывы посетителей собирает «Гостевая книга».'
			},
			{
				type: 'choose',
				widget: 'ucPanel',
				prompt: 'Выберите модуль, где публиковать акции и новости клиники.',
				options: ['Новости сайта', 'Каталог файлов', 'Онлайн-игры'],
				answer: 0,
				hint: 'Модуль новостей для ленты публикаций.'
			},
			{
				type: 'choose',
				widget: 'ucPanel',
				prompt: 'Выберите модуль для фотографий кабинетов и оборудования.',
				options: ['Фотоальбомы', 'Форум', 'Тесты'],
				answer: 0,
				hint: 'Галереи изображений живут в «Фотоальбомах».'
			}
		]
	},
	{
		slug: 'uc-landing',
		product: 'ucoz',
		order: 3,
		title: 'Страница записи',
		reward: { coins: 200, xp: 80 },
		active: true,
		steps: [
			{
				type: 'drag',
				widget: 'ucPageBuilder',
				prompt: 'Поставьте заголовок с предложением клиники на первый экран.',
				item: 'heading',
				zone: 'heading:hero',
				hint: 'Первый экран посетитель видит без прокрутки.'
			},
			{
				type: 'drag',
				widget: 'ucPageBuilder',
				prompt: 'Добавьте форму заявки в основной блок.',
				item: 'form',
				zone: 'form:content',
				hint: 'Форма записи на приём и есть цель страницы.'
			},
			{
				type: 'drag',
				widget: 'ucPageBuilder',
				prompt: 'Разместите карту проезда в подвале.',
				item: 'map',
				zone: 'map:footer',
				hint: 'Контакты и карту ищут в самом низу.'
			},
			{
				type: 'choose',
				widget: 'ucPanel',
				prompt: 'Выберите, куда должна вести кнопка на первом экране.',
				options: ['К форме записи на приём', 'На главную uCoz', 'На страницу «О компании»'],
				answer: 0,
				hint: 'У лендинга одна цель, кнопка ведёт к ней.'
			}
		]
	},
	{
		slug: 'uc-domain',
		product: 'ucoz',
		order: 4,
		title: 'Свой домен',
		reward: { coins: 220, xp: 90 },
		active: true,
		steps: [
			{
				type: 'input',
				widget: 'ucDomain',
				prompt: 'Введите домен клиники, который купили у регистратора.',
				field: 'domain',
				minLength: 5,
				maxLength: 40,
				mustInclude: ['.'],
				mustExclude: ['http', '/', ' ', 'ucoz'],
				hint: 'Только имя домена, например ulybka-dental.ru, без https и слэшей.'
			},
			{
				type: 'choose',
				widget: 'ucDomain',
				prompt: 'Выберите NS-серверы, которые нужно указать у регистратора.',
				options: ['ns1.ucoz.net, ns2.ucoz.net, ns3.ucoz.net', 'ns1.google.com', 'Ничего не менять'],
				answer: 0,
				hint: 'Домен должен смотреть на серверы uCoz.'
			},
			{
				type: 'choose',
				widget: 'ucDomain',
				prompt: 'Домен в зоне .ru. Выберите, сколько может занять делегирование.',
				options: ['До 9 часов', 'Ровно минуту', 'Около месяца'],
				answer: 0,
				hint: 'Для .рф и .su быстрее, до 2 часов.'
			},
			{
				type: 'click',
				widget: 'ucDomain',
				prompt: 'Прикрепите домен к сайту.',
				target: 'attach',
				hint: 'Кнопка внизу панели.'
			},
			{
				type: 'click',
				widget: 'ucPanel',
				prompt: 'Осталось включить SSL-сертификат. Откройте раздел, где он настраивается.',
				target: 'security',
				hint: 'Сертификаты и защита сайта в разделе «Безопасность».'
			}
		]
	},
	{
		slug: 'uc-seo',
		product: 'ucoz',
		order: 5,
		title: 'SEO и запуск',
		reward: { coins: 250, xp: 100 },
		active: true,
		steps: [
			{
				type: 'input',
				widget: 'ucSettings',
				prompt: 'Напишите Title главной страницы: услуга и город.',
				field: 'title',
				minLength: 15,
				maxLength: 70,
				mustExclude: ['!!!', 'лучший в мире'],
				hint: 'Например: Стоматология в Казани, лечение без боли. До 70 знаков.'
			},
			{
				type: 'choose',
				widget: 'ucPanel',
				prompt: 'Выберите, что даёт SEO-модуль на тарифе «Оптимальный».',
				options: [
					'Мета-теги, настройку URL и robots.txt',
					'Больше места на диске',
					'Скрывает копирайт в подвале'
				],
				answer: 0,
				hint: 'SEO-модуль отвечает за то, как сайт видят поисковики.'
			},
			{
				type: 'choose',
				widget: 'ucPanel',
				prompt: 'Выберите, что убирает переход с бесплатного тарифа на платный.',
				options: ['Рекламный баннер и копирайт системы', 'Модуль новостей', 'Ваш домен'],
				answer: 0,
				hint: 'Реклама показывается только на бесплатном тарифе.'
			},
			{
				type: 'click',
				widget: 'ucPanel',
				prompt: 'Перед запуском сделайте резервную копию. Откройте нужный раздел.',
				target: 'tools',
				hint: 'Резервное копирование и файловый менеджер в «Инструментах».'
			}
		]
	}
];

const webask: Lesson[] = [
	{
		slug: 'wa-first-survey',
		product: 'webask',
		order: 1,
		title: 'Первый опрос',
		reward: { coins: 150, xp: 60 },
		active: true,
		steps: [
			{
				type: 'click',
				widget: 'waDashboard',
				prompt: 'Сервису доставки нужен опрос удовлетворённости. Создайте новый опрос.',
				target: 'create',
				hint: 'Кнопка справа над списком опросов.'
			},
			{
				type: 'input',
				widget: 'waQuestionText',
				prompt: 'Сформулируйте первый вопрос о доставке нейтрально, без подсказки ответа.',
				field: 'question',
				minLength: 15,
				maxLength: 120,
				mustExclude: ['ведь', 'не правда ли', 'согласитесь', '?!'],
				hint: 'Например: Насколько вы довольны скоростью доставки последнего заказа?'
			},
			{
				type: 'choose',
				widget: 'waQuestionType',
				prompt: 'Нужна оценка от 1 до 10. Выберите тип вопроса.',
				options: ['Шкала 1–10', 'Открытый вопрос', 'Матрица', 'Загрузка файла'],
				answer: 0,
				hint: 'Числовую оценку одним значением даёт шкала.'
			},
			{
				type: 'click',
				widget: 'waQuestionText',
				prompt: 'Без ответа на этот вопрос отчёт бессмысленен. Сделайте вопрос обязательным.',
				target: 'required',
				hint: 'Чекбокс «Обязательный» под вариантами.'
			},
			{
				type: 'click',
				widget: 'waPublish',
				prompt: 'Опубликуйте опрос, чтобы получить ссылку.',
				target: 'publish',
				hint: 'Черновик не принимает ответы.'
			}
		]
	},
	{
		slug: 'wa-structure',
		product: 'webask',
		order: 2,
		title: 'Структура анкеты',
		reward: { coins: 180, xp: 70 },
		active: true,
		steps: [
			{
				type: 'order',
				widget: 'orderList',
				prompt: 'Расставьте экраны анкеты так, чтобы респондент дошёл до конца.',
				items: [
					'Экран приветствия: цель и время прохождения',
					'Скрининг: пользовались ли доставкой за месяц?',
					'Основные вопросы об опыте заказа',
					'Открытый вопрос: что улучшить?',
					'Страница благодарности'
				],
				correct: [0, 1, 2, 3, 4],
				hint: 'Сначала объясняем, потом отсеиваем, открытые вопросы ближе к концу.'
			},
			{
				type: 'choose',
				widget: 'waQuestionType',
				prompt: 'Выберите оптимальное число вопросов для опроса клиентов.',
				options: ['6–10', '30 и больше', 'Один'],
				answer: 0,
				hint: 'Длинные анкеты бросают на середине.'
			},
			{
				type: 'choose',
				widget: 'waQuestionType',
				prompt: 'Выберите, что сообщить респонденту на экране приветствия.',
				options: [
					'Сколько времени займёт опрос и зачем он',
					'Список всех вопросов',
					'Правильные ответы'
				],
				answer: 0,
				hint: 'Честное ожидание по времени повышает завершаемость.'
			},
			{
				type: 'click',
				widget: 'waQuestionText',
				prompt: 'В вопросе о причинах не все варианты предусмотрены. Добавьте вариант «Другое».',
				target: 'addOption',
				hint: 'Кнопка «Добавить вариант» под списком.'
			}
		]
	},
	{
		slug: 'wa-logic',
		product: 'webask',
		order: 3,
		title: 'Логика ветвления',
		reward: { coins: 200, xp: 80 },
		active: true,
		steps: [
			{
				type: 'click',
				widget: 'waLogic',
				prompt:
					'Тем, кто не пользуется приложением, вопросы о нём не нужны. Добавьте переход по условию.',
				target: 'addRule',
				hint: 'Кнопка в шапке раздела «Логические ветвления».'
			},
			{
				type: 'choose',
				widget: 'waLogic',
				prompt: 'Ответ «Нет». Выберите, куда перевести респондента.',
				options: [
					'Вопрос 7: Как вы оформляете заказ?',
					'Вопрос 3: Что нравится в приложении?',
					'Вопрос 4: Как часто открываете приложение?'
				],
				answer: 0,
				hint: 'Пропускаем весь блок про приложение, вопросы 3–6.'
			},
			{
				type: 'choose',
				widget: 'waLogic',
				prompt: 'Респондент не прошёл скрининг. Выберите, что ему показать.',
				options: ['Отдельный экран завершения', 'Все вопросы подряд', 'Пустую страницу'],
				answer: 0,
				hint: 'Скринаут ведёт на свой экран с благодарностью.'
			},
			{
				type: 'choose',
				widget: 'waLogic',
				prompt: 'Логика настроена. Выберите, что сделать перед запуском.',
				options: ['Пройти каждую ветку вручную', 'Сразу разослать', 'Удалить лишние вопросы'],
				answer: 0,
				hint: 'Ошибку в переходе увидит только тот, кто прошёл ветку сам.'
			}
		]
	},
	{
		slug: 'wa-nps',
		product: 'webask',
		order: 4,
		title: 'NPS и тесты',
		reward: { coins: 220, xp: 90 },
		active: true,
		steps: [
			{
				type: 'choose',
				widget: 'waQuestionType',
				prompt: 'Нужно измерить готовность рекомендовать сервис. Выберите тип вопроса.',
				options: ['NPS', 'Матрица', 'Дата и время', 'Загрузка файла'],
				answer: 0,
				hint: 'NPS сам делит ответы на промоутеров, нейтралов и критиков.'
			},
			{
				type: 'choose',
				widget: 'waResults',
				prompt: 'Выберите, кто в NPS считается промоутером.',
				options: ['Оценки 9–10', 'Оценки 7–8', 'Оценки 0–6'],
				answer: 0,
				hint: '7–8 нейтралы, 0–6 критики.'
			},
			{
				type: 'click',
				widget: 'waQuestionText',
				prompt: 'Для теста курьеров включите подсчёт баллов у вопроса.',
				target: 'points',
				hint: 'Переключатель «Баллы» рядом с «Обязательный».'
			},
			{
				type: 'choose',
				widget: 'waResults',
				prompt: 'Выберите, как показать курьеру результат теста.',
				options: [
					'Текст по диапазонам набранных баллов',
					'Не показывать никак',
					'Список всех ответов других курьеров'
				],
				answer: 0,
				hint: 'Результат настраивается отдельно для каждого диапазона баллов.'
			}
		]
	},
	{
		slug: 'wa-launch',
		product: 'webask',
		order: 5,
		title: 'Публикация и анализ',
		reward: { coins: 250, xp: 100 },
		active: true,
		steps: [
			{
				type: 'choose',
				widget: 'waPublish',
				prompt: 'Опрос гостей ресторана на столиках. Выберите канал распространения.',
				options: ['QR-код на столике', 'Email-рассылка', 'Виджет на сайте', 'Ссылка в соцсетях'],
				answer: 0,
				hint: 'Гость уже за столом, телефон в руке.'
			},
			{
				type: 'click',
				widget: 'waPublish',
				prompt: 'Скопируйте ссылку, чтобы отправить её менеджеру.',
				target: 'copy',
				hint: 'Кнопка рядом с полем ссылки.'
			},
			{
				type: 'choose',
				widget: 'waResults',
				prompt: 'Прошёл первый день сбора. Выберите, что проверить в результатах первым.',
				options: ['На каком вопросе бросают опрос', 'Цвет кнопок', 'Название опроса'],
				answer: 0,
				hint: 'Воронка завершения показывает проблемный вопрос.'
			},
			{
				type: 'click',
				widget: 'waResults',
				prompt: 'Выгрузите ответы для аналитика в таблицу.',
				target: 'export:xlsx',
				hint: 'XLSX открывается в Excel и Google Sheets.'
			}
		]
	}
];

export const lessons: Lesson[] = [...rusender, ...ucoz, ...webask];

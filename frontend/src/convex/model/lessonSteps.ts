/** Общие поля оформления экрана виджета, доступные любому шагу */
type StepUi = {
	/** Заголовок панели виджета, если он должен отличаться от стандартного */
	title?: string;
	/** Подпись под заголовком: контекст экрана (какой раздел, какой шаг, что тестируем) */
	note?: string;
};

export type ClickStep = StepUi & {
	type: 'click';
	widget: string;
	prompt: string;
	target: string;
	hint?: string;
};

export type ChooseStep = StepUi & {
	type: 'choose';
	widget: string;
	prompt: string;
	options: string[];
	answer: number;
	hint?: string;
	/** Вторая строка для каждого варианта, например число контактов */
	meta?: string[];
};

export type DragStep = StepUi & {
	type: 'drag';
	widget: string;
	prompt: string;
	item: string;
	zone: string;
	hint?: string;
};

export type InputStep = StepUi & {
	type: 'input';
	widget: string;
	prompt: string;
	field: string;
	minLength?: number;
	maxLength?: number;
	mustInclude?: string[];
	mustExclude?: string[];
	hint?: string;
	/** Пример в пустом поле, подходящий именно этому уроку */
	placeholder?: string;
};

export type OrderStep = StepUi & {
	type: 'order';
	widget: string;
	prompt: string;
	/** Названия узлов. Формат «Тип: описание» даёт заголовок и подзаголовок карточки */
	items: string[];
	correct: number[];
	hint?: string;
	/** Пояснение к каждому узлу в том же порядке, что и items */
	details?: string[];
};

export type LessonStep = ClickStep | ChooseStep | DragStep | InputStep | OrderStep;

export type LessonContent = {
	slug: string;
	product: string;
	order: number;
	title: string;
	/** Одна фраза о том, что игрок сделает в уроке. Показывается на карточке и над шагами */
	description?: string;
	steps: LessonStep[];
	reward: { coins: number; xp: number };
};

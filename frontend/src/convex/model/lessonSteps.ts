export type ClickStep = {
	type: 'click';
	widget: string;
	prompt: string;
	target: string;
	hint?: string;
};

export type ChooseStep = {
	type: 'choose';
	widget: string;
	prompt: string;
	options: string[];
	answer: number;
	hint?: string;
};

export type DragStep = {
	type: 'drag';
	widget: string;
	prompt: string;
	item: string;
	zone: string;
	hint?: string;
};

export type InputStep = {
	type: 'input';
	widget: string;
	prompt: string;
	field: string;
	minLength?: number;
	maxLength?: number;
	mustInclude?: string[];
	mustExclude?: string[];
	hint?: string;
};

export type OrderStep = {
	type: 'order';
	widget: string;
	prompt: string;
	items: string[];
	correct: number[];
	hint?: string;
};

export type LessonStep = ClickStep | ChooseStep | DragStep | InputStep | OrderStep;

export type LessonContent = {
	slug: string;
	product: string;
	order: number;
	title: string;
	steps: LessonStep[];
	reward: { coins: number; xp: number };
};

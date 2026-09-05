import type { LessonStep } from '../../../convex/model/lessonSteps';

export type Action =
	| { kind: 'click'; value: string }
	| { kind: 'drop'; value: string }
	| { kind: 'input'; value: string }
	| { kind: 'choose'; value: number }
	| { kind: 'order'; value: number[] };

export function validate(step: LessonStep, action: Action | null): boolean {
	if (!action) return false;
	switch (step.type) {
		case 'click':
			return action.kind === 'click' && action.value === step.target;
		case 'drag':
			return action.kind === 'drop' && action.value === step.zone;
		case 'choose':
			return action.kind === 'choose' && action.value === step.answer;
		case 'order':
			return (
				action.kind === 'order' &&
				action.value.length === step.correct.length &&
				action.value.every((v, i) => v === step.correct[i])
			);
		case 'input': {
			if (action.kind !== 'input') return false;
			const text = action.value.trim();
			if (step.minLength && text.length < step.minLength) return false;
			if (step.maxLength && text.length > step.maxLength) return false;
			const lower = text.toLowerCase();
			if (step.mustInclude?.some((w) => !lower.includes(w.toLowerCase()))) return false;
			if (step.mustExclude?.some((w) => lower.includes(w.toLowerCase()))) return false;
			return true;
		}
	}
}

export function isInstant(step: LessonStep): boolean {
	return step.type === 'click' || step.type === 'drag';
}

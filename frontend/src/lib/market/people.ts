export type Pose = 'stand' | 'sit' | 'confused';

const SETS: Record<string, Record<Pose, string>> = {
	player: {
		stand: 'male-manager-sitting-and-working-on-laptop',
		sit: 'male-manager-sitting-and-working-on-laptop',
		confused: 'male-manager-standing-with-confused-pose'
	},
	lena: {
		stand: 'executive-businesswoman-giving-thumbs-up',
		sit: 'executive-businesswoman-sitting-and-working-on-laptop',
		confused: 'executive-businesswoman-standing-with-confused-pose'
	},
	maks: {
		stand: 'executive-businessman-standing-neutral',
		sit: 'executive-businessman-sitting-and-working-on-laptop',
		confused: 'executive-businessman-standing-with-confused-pose'
	},
	dasha: {
		stand: 'professional-businesswoman-happy-jumping',
		sit: 'professional-businesswoman-sitting-and-working-on-laptop',
		confused: 'professional-businesswoman-sitting-and-thinking-with-laptop'
	},
	timur: {
		stand: 'office-male-employee-standing-with-arms-crossed',
		sit: 'office-male-employee-sitting-and-thinking-with-laptop',
		confused: 'office-male-employee-standing-with-confused-pose'
	},
	olya: {
		stand: 'female-manager-showing-nice-gesture',
		sit: 'female-manager-sitting-and-working-on-laptop',
		confused: 'female-manager-standing-with-confused-pose'
	},
	artem: {
		stand: 'executive-businessman-listening-carefully',
		sit: 'executive-businessman-sitting-and-thinking-with-laptop',
		confused: 'executive-businessman-giving-shocked-expression'
	},
	nastya: {
		stand: 'office-woman-employee-standing-proudly',
		sit: 'office-woman-employee-sitting-and-thinking-with-laptop',
		confused: 'office-woman-employee-standing-with-confused-pose'
	}
};

const BY_NAME: Record<string, string> = {
	Лена: 'lena',
	Макс: 'maks',
	Даша: 'dasha',
	Тимур: 'timur',
	Оля: 'olya',
	Артём: 'artem',
	Настя: 'nastya'
};

export function portrait(who: string, pose: Pose = 'stand'): string | undefined {
	const set = SETS[who] ?? SETS[BY_NAME[who] ?? ''];
	return set ? `/img/people/${set[pose]}.webp` : undefined;
}

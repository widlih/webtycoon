import { animate } from 'animejs';

type Point = { x: number; y: number };
type Reward = { coins?: number; xp?: number };

const COLORS = ['#f5ff63', '#a981ff', '#50b8ff', '#19171c'];

function targetCenter(kind: 'coins' | 'xp'): Point | null {
	const el = document.querySelector<HTMLElement>(`[data-fly-target="${kind}"]`);
	if (!el) return null;
	const r = el.getBoundingClientRect();
	return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function pulse(kind: 'coins' | 'xp') {
	const el = document.querySelector<HTMLElement>(`[data-fly-target="${kind}"]`);
	if (!el) return;
	animate(el, {
		scale: [1, 1.18, 1],
		duration: 480,
		ease: 'outBack'
	});
}

function spawn(from: Point, to: Point, count: number, className: string, delayStep: number) {
	for (let i = 0; i < count; i++) {
		const dot = document.createElement('span');
		dot.className = className;
		dot.style.left = `${from.x}px`;
		dot.style.top = `${from.y}px`;
		document.body.appendChild(dot);
		const spread = { x: (Math.random() - 0.5) * 80, y: -30 - Math.random() * 50 };
		animate(dot, {
			translateX: [0, spread.x, to.x - from.x],
			translateY: [0, spread.y, to.y - from.y],
			scale: [0.4, 1.1, 0.5],
			opacity: [0, 1, 1, 0.9],
			duration: 820,
			delay: i * delayStep,
			ease: 'inOutCubic',
			onComplete: () => dot.remove()
		});
	}
}

export function flyReward(from: Point, reward: Reward) {
	const coins = targetCenter('coins');
	const xp = targetCenter('xp');
	const coinCount = Math.min(8, 3 + Math.round((reward.coins ?? 0) / 60));
	if (coins && (reward.coins ?? 0) > 0) {
		spawn(from, coins, coinCount, 'fx-coin', 55);
		setTimeout(() => pulse('coins'), 700 + coinCount * 55);
	}
	if (xp && (reward.xp ?? 0) > 0) {
		setTimeout(() => spawn(from, xp, 4, 'fx-star', 80), 250);
		setTimeout(() => pulse('xp'), 1250);
	}
}

export function burst(el: HTMLElement, count = 26) {
	const rect = el.getBoundingClientRect();
	const origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
	for (let i = 0; i < count; i++) {
		const piece = document.createElement('span');
		piece.className = 'fx-confetti';
		piece.style.left = `${origin.x}px`;
		piece.style.top = `${origin.y}px`;
		piece.style.background = COLORS[i % COLORS.length];
		document.body.appendChild(piece);
		const angle = Math.random() * Math.PI * 2;
		const dist = 90 + Math.random() * 140;
		animate(piece, {
			translateX: Math.cos(angle) * dist,
			translateY: [Math.sin(angle) * dist - 60, Math.sin(angle) * dist + 120],
			rotate: Math.random() * 720 - 360,
			scale: [1, 0.6],
			opacity: [1, 1, 0],
			duration: 1100 + Math.random() * 400,
			ease: 'outCubic',
			onComplete: () => piece.remove()
		});
	}
}

export function centerOf(el: HTMLElement | null): Point {
	if (!el) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
	const r = el.getBoundingClientRect();
	return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

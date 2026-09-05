import { SvelteSet } from 'svelte/reactivity';
import { SLIDES, type OnboardingScreen } from './slides';

const STORAGE_PREFIX = 'wt.onboarding.v1';

function storageKey(playerId: string) {
	return `${STORAGE_PREFIX}:${playerId}`;
}

function readSeen(playerId: string): OnboardingScreen[] {
	try {
		const raw = localStorage.getItem(storageKey(playerId));
		if (!raw) return [];
		const parsed: unknown = JSON.parse(raw);
		return Array.isArray(parsed) ? (parsed as OnboardingScreen[]) : [];
	} catch {
		return [];
	}
}

function writeSeen(playerId: string, seen: Iterable<OnboardingScreen>) {
	try {
		localStorage.setItem(storageKey(playerId), JSON.stringify([...seen]));
	} catch {
		/* приватный режим или заблокированное хранилище: просто не запоминаем */
	}
}

class OnboardingState {
	/** Экран, подсказки которого сейчас открыты */
	screen = $state<OnboardingScreen | null>(null);
	index = $state(0);
	playerId = $state<string | null>(null);

	private seen = new SvelteSet<OnboardingScreen>();

	constructor() {
		// Методы передаются как колбэки (onclick и т.п.), поэтому фиксируем this
		this.open = this.open.bind(this);
		this.next = this.next.bind(this);
		this.close = this.close.bind(this);
		this.reset = this.reset.bind(this);
	}

	readonly slides = $derived(this.screen ? SLIDES[this.screen] : []);
	readonly slide = $derived(this.slides[this.index] ?? null);
	readonly isLast = $derived(this.index >= this.slides.length - 1);

	setPlayer(playerId: string | null) {
		if (playerId === this.playerId) return;
		this.playerId = playerId;
		this.seen.clear();
		if (playerId) for (const screen of readSeen(playerId)) this.seen.add(screen);
	}

	hasSeen(screen: OnboardingScreen) {
		return this.seen.has(screen);
	}

	/** Открыть подсказки экрана. Без `force` открывает только если ещё не показывали. */
	open(screen: OnboardingScreen, force = false) {
		if (!force && this.seen.has(screen)) return;
		if (!SLIDES[screen]?.length) return;
		this.screen = screen;
		this.index = 0;
	}

	next() {
		if (this.isLast) this.close();
		else this.index += 1;
	}

	close() {
		if (this.screen) {
			this.seen.add(this.screen);
			if (this.playerId) writeSeen(this.playerId, this.seen);
		}
		this.screen = null;
		this.index = 0;
	}

	/** Сбросить отметки: подсказки снова покажутся при заходе на каждый экран */
	reset() {
		this.seen.clear();
		if (this.playerId) writeSeen(this.playerId, this.seen);
	}
}

export const onboarding = new OnboardingState();

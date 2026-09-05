import { Howl } from 'howler';
import { browser } from '$app/environment';

const KEY = 'wt.music';

let howl: Howl | null = null;
let enabled = $state(false);
let unlocked = false;

function create() {
	if (howl) return howl;
	howl = new Howl({ src: ['/sounds/theme.mp3'], loop: true, volume: 0.35, html5: true });
	return howl;
}

function play() {
	const h = create();
	if (!h.playing()) h.play();
}

function onFirstGesture() {
	unlocked = true;
	window.removeEventListener('pointerdown', onFirstGesture);
	window.removeEventListener('keydown', onFirstGesture);
	if (enabled) play();
}

export function initMusic() {
	if (!browser) return;
	try {
		enabled = localStorage.getItem(KEY) === 'on';
	} catch {
		enabled = false;
	}
	if (enabled) {
		window.addEventListener('pointerdown', onFirstGesture, { once: true });
		window.addEventListener('keydown', onFirstGesture, { once: true });
	}
}

export function toggleMusic() {
	enabled = !enabled;
	try {
		localStorage.setItem(KEY, enabled ? 'on' : 'off');
	} catch {
		/* storage unavailable */
	}
	if (enabled) {
		unlocked = true;
		play();
	} else {
		howl?.pause();
	}
}

export function isMusicOn() {
	return enabled;
}

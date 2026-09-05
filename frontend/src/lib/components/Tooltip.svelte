<script lang="ts">
	import { onMount } from 'svelte';

	let text = $state('');
	let visible = $state(false);
	let x = $state(0);
	let y = $state(0);
	let below = $state(false);
	let el = $state<HTMLDivElement | null>(null);

	let current: HTMLElement | null = null;
	let showTimer: ReturnType<typeof setTimeout> | null = null;
	let hideTimer: ReturnType<typeof setTimeout> | null = null;

	function place(target: HTMLElement) {
		const r = target.getBoundingClientRect();
		const w = el?.offsetWidth ?? 0;
		const h = el?.offsetHeight ?? 0;
		below = r.top - h - 10 < 8;
		y = below ? r.bottom + 10 : r.top - h - 10;
		x = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), window.innerWidth - w - 8);
	}

	function show(target: HTMLElement, delay: number) {
		const tip = target.dataset.tip;
		if (!tip) return;
		if (hideTimer) clearTimeout(hideTimer);
		if (showTimer) clearTimeout(showTimer);
		current = target;
		showTimer = setTimeout(() => {
			text = tip;
			visible = true;
			requestAnimationFrame(() => current && place(current));
		}, delay);
	}

	function hide(after = 0) {
		if (showTimer) clearTimeout(showTimer);
		showTimer = null;
		if (hideTimer) clearTimeout(hideTimer);
		hideTimer = setTimeout(() => {
			visible = false;
			current = null;
		}, after);
	}

	const tipOf = (t: EventTarget | null) =>
		t instanceof Element ? t.closest<HTMLElement>('[data-tip]') : null;

	onMount(() => {
		const over = (e: PointerEvent) => {
			if (e.pointerType === 'touch') return;
			const target = tipOf(e.target);
			if (target && target !== current) show(target, 250);
		};
		const out = (e: PointerEvent) => {
			if (!current) return;
			if (e.relatedTarget instanceof Node && current.contains(e.relatedTarget)) return;
			if (tipOf(e.target) === current) hide();
		};
		const down = (e: PointerEvent) => {
			if (e.pointerType !== 'touch') return;
			const target = tipOf(e.target);
			if (target) {
				show(target, 0);
				hide(1800);
			}
		};
		const focusIn = (e: FocusEvent) => {
			const target = tipOf(e.target);
			if (target) show(target, 0);
		};
		const focusOut = () => hide();
		const cancel = () => hide();
		document.addEventListener('pointerover', over);
		document.addEventListener('pointerout', out);
		document.addEventListener('pointerdown', down, true);
		document.addEventListener('focusin', focusIn);
		document.addEventListener('focusout', focusOut);
		window.addEventListener('scroll', cancel, true);
		window.addEventListener('resize', cancel);
		return () => {
			document.removeEventListener('pointerover', over);
			document.removeEventListener('pointerout', out);
			document.removeEventListener('pointerdown', down, true);
			document.removeEventListener('focusin', focusIn);
			document.removeEventListener('focusout', focusOut);
			window.removeEventListener('scroll', cancel, true);
			window.removeEventListener('resize', cancel);
		};
	});
</script>

<div
	bind:this={el}
	class="tip"
	class:is-visible={visible}
	class:is-below={below}
	role="tooltip"
	style="left: {x}px; top: {y}px"
>
	{text}
</div>

<style>
	.tip {
		position: fixed;
		z-index: 90;
		max-width: 240px;
		padding: 8px 12px;
		border-radius: 12px;
		background: var(--ink, #19171c);
		color: #fff;
		font: 500 13px/1.35 var(--text-font, system-ui);
		letter-spacing: -0.26px;
		text-align: center;
		pointer-events: none;
		opacity: 0;
		transform: translateY(4px) scale(0.96);
		transition:
			opacity 0.18s var(--quad, ease-out),
			transform 0.25s var(--ease-overshoot-linear, ease-out);
		box-shadow:
			0 10px 20px #0000001f,
			0 2px 5px #0000000f;
	}
	.tip::after {
		content: '';
		position: absolute;
		left: 50%;
		bottom: -5px;
		width: 10px;
		height: 10px;
		background: inherit;
		border-radius: 2px;
		transform: translateX(-50%) rotate(45deg);
	}
	.tip.is-below::after {
		bottom: auto;
		top: -5px;
	}
	.tip.is-visible {
		opacity: 1;
		transform: none;
	}
</style>

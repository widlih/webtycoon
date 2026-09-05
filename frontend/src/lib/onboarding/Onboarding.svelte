<script lang="ts">
	import { page } from '$app/state';
	import { X } from '@lucide/svelte';
	import { untrack } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { onboarding } from './state.svelte';
	import { SCREEN_PATHS, type OnboardingScreen } from './slides';

	let { playerId }: { playerId: string | null } = $props();

	let btn = $state<HTMLButtonElement | null>(null);

	function screenOf(pathname: string): OnboardingScreen | null {
		const path = pathname.replace(/\/+$/, '') || '/';
		for (const [screen, href] of Object.entries(SCREEN_PATHS)) {
			if (href === path) return screen as OnboardingScreen;
		}
		return null;
	}

	$effect(() => {
		onboarding.setPlayer(playerId);
	});

	// Первый заход на экран: показываем подсказки, если игрок их ещё не видел.
	$effect(() => {
		const screen = screenOf(page.url.pathname);
		const ready = playerId !== null;
		untrack(() => {
			if (!screen || !ready) return;
			if (onboarding.screen && onboarding.screen !== screen) onboarding.close();
			onboarding.open(screen);
		});
	});

	$effect(() => {
		if (!onboarding.screen) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prev;
		};
	});

	$effect(() => {
		if (!onboarding.screen) return;
		const shown = onboarding.index;
		requestAnimationFrame(() => {
			if (onboarding.index === shown) btn?.focus({ preventScroll: true });
		});
	});

	function onkeydown(e: KeyboardEvent) {
		if (!onboarding.screen) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			onboarding.close();
		} else if (e.key === 'ArrowRight' || e.key === 'Enter') {
			if (e.target === btn && e.key === 'Enter') return;
			e.preventDefault();
			onboarding.next();
		} else if (e.key === 'ArrowLeft' && onboarding.index > 0) {
			e.preventDefault();
			onboarding.index -= 1;
		}
	}

	function onOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) onboarding.close();
	}
</script>

<svelte:window {onkeydown} />

{#if onboarding.slide}
	{@const slide = onboarding.slide}
	{@const many = onboarding.slides.length > 1}
	<div class="ob" role="presentation" transition:fade={{ duration: 180 }} onclick={onOverlayClick}>
		<div
			class="ob__card"
			role="dialog"
			aria-modal="true"
			aria-labelledby="ob-title"
			aria-describedby="ob-text"
			transition:fly={{ y: 28, duration: 360 }}
		>
			<button
				type="button"
				class="ob__close"
				aria-label="Закрыть"
				onclick={() => onboarding.close()}
			>
				<X size={18} strokeWidth={2.5} />
			</button>

			<div class="ob__art" aria-hidden="true">
				{#key onboarding.index}
					<div class="ob__coins">
						{#each slide.art as coin, i (i)}
							<span
								class="ob__coin ob__coin--{coin.color}"
								style="--s:{coin.size}px; --x:{coin.x}%; --y:{coin.y}%; --rot:{coin.rot ??
									0}deg; --d:{i * 0.12}s; --fd:{i * 0.55}s"
							>
								<coin.icon size={Math.round(coin.size * 0.46)} strokeWidth={2.25} />
							</span>
						{/each}
					</div>
				{/key}
			</div>

			<div class="ob__body">
				{#key onboarding.index}
					<div class="ob__content">
						<h2 id="ob-title" class="ob__title">{slide.title}</h2>
						<p id="ob-text" class="ob__text">{slide.text}</p>
					</div>
				{/key}

				{#if many}
					<div class="ob__steps" aria-hidden="true">
						{#each onboarding.slides, i (i)}
							<span class="ob__step" class:is-active={i === onboarding.index}></span>
						{/each}
					</div>
				{/if}

				<button type="button" class="ob__btn" bind:this={btn} onclick={() => onboarding.next()}>
					{slide.cta ?? 'Понятно'}
				</button>
				{#if many}
					<p class="ob__counter">
						{onboarding.index + 1} из {onboarding.slides.length}
					</p>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.ob {
		position: fixed;
		inset: 0;
		z-index: 60;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px;
		background: #19171ca6;
		-webkit-backdrop-filter: blur(6px);
		backdrop-filter: blur(6px);
	}
	.ob__card {
		position: relative;
		width: min(100%, 380px);
		max-height: calc(100vh - 32px);
		max-height: calc(100dvh - 32px);
		overflow: auto;
		background: #fff;
		border-radius: 32px;
		box-shadow:
			0 30px 60px -20px #19171c66,
			0 4px 12px #19171c1f;
		scrollbar-width: none;
	}
	.ob__card::-webkit-scrollbar {
		display: none;
	}
	.ob__close {
		position: absolute;
		top: 14px;
		right: 14px;
		z-index: 2;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: 0;
		border-radius: 50%;
		background: #ffffffcc;
		color: var(--ink);
		cursor: pointer;
		transition:
			background-color 0.2s var(--quad),
			transform 0.3s var(--ease-overshoot-linear);
	}
	.ob__close:hover {
		background: #fff;
		transform: scale(1.08);
	}

	.ob__art {
		position: relative;
		height: 236px;
		background: radial-gradient(120% 90% at 50% 100%, #ffffff00 40%, #ffffff80 100%), var(--gray);
		overflow: hidden;
	}
	.ob__coins {
		position: absolute;
		inset: 0;
	}
	.ob__coin {
		position: absolute;
		left: var(--x);
		top: var(--y);
		width: var(--s);
		height: var(--s);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		translate: -50% -50%;
		rotate: var(--rot);
		box-shadow:
			inset 0 0 0 calc(var(--s) * 0.07) #ffffff59,
			inset 0 calc(var(--s) * -0.08) calc(var(--s) * 0.16) #00000024,
			inset 0 calc(var(--s) * 0.06) calc(var(--s) * 0.12) #ffffff8c,
			0 calc(var(--s) * 0.16) calc(var(--s) * 0.26) calc(var(--s) * -0.08) #19171c59;
		animation:
			ob-pop 0.55s var(--spring) var(--d) both,
			ob-float 3.4s ease-in-out calc(var(--d) + var(--fd)) infinite;
	}
	.ob__coin::after {
		content: '';
		position: absolute;
		inset: calc(var(--s) * 0.16);
		border-radius: 50%;
		border: calc(var(--s) * 0.02) solid #ffffff40;
		pointer-events: none;
	}
	.ob__coin :global(svg) {
		position: relative;
		z-index: 1;
		filter: drop-shadow(0 2px 2px #0000001f);
	}
	.ob__coin--violet {
		background: radial-gradient(circle at 32% 28%, #dccbff 0%, var(--violet) 48%, #8b5ee6 100%);
		color: #fff;
	}
	.ob__coin--yellow {
		background: radial-gradient(circle at 32% 28%, #fdffb3 0%, var(--yellow) 48%, #cdd82a 100%);
		color: var(--ink);
	}
	.ob__coin--silver {
		background: radial-gradient(circle at 32% 28%, #ffffff 0%, #e4e3e8 48%, #b9b8c0 100%);
		color: var(--secondary);
	}
	.ob__coin--blue {
		background: radial-gradient(circle at 32% 28%, #e3ecff 0%, #b9cfff 48%, #7c9ff0 100%);
		color: #fff;
	}
	.ob__coin--ink {
		background: radial-gradient(circle at 32% 28%, #4a4750 0%, #2a272f 48%, var(--ink) 100%);
		color: #fff;
	}

	@keyframes ob-pop {
		from {
			scale: 0.4;
			opacity: 0;
		}
		to {
			scale: 1;
			opacity: 1;
		}
	}
	@keyframes ob-float {
		0%,
		100% {
			translate: -50% -50%;
		}
		50% {
			translate: -50% calc(-50% - 7px);
		}
	}

	.ob__body {
		padding: 22px 24px 18px;
		text-align: center;
	}
	.ob__content {
		animation: ob-in 0.32s var(--quad) both;
	}
	@keyframes ob-in {
		from {
			opacity: 0;
			translate: 0 8px;
		}
		to {
			opacity: 1;
			translate: 0 0;
		}
	}
	.ob__title {
		margin: 0;
		color: var(--ink);
		font: 600 22px/120% var(--display);
		letter-spacing: -0.44px;
	}
	.ob__text {
		margin: 10px 0 0;
		color: var(--secondary);
		font: 400 15px/150% var(--text-font);
		letter-spacing: -0.15px;
		text-wrap: pretty;
	}
	.ob__steps {
		display: flex;
		justify-content: center;
		gap: 6px;
		margin-top: 18px;
	}
	.ob__step {
		width: 36px;
		height: 4px;
		border-radius: 4px;
		background: #e5e4e7;
		transition: background-color 0.3s var(--quad);
	}
	.ob__step.is-active {
		background: var(--ink);
	}
	.ob__btn {
		appearance: none;
		display: block;
		width: 100%;
		height: 56px;
		margin-top: 18px;
		border: 0;
		border-radius: 20px;
		background: var(--yellow);
		color: var(--ink);
		font: 600 15px/1 var(--display);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		cursor: pointer;
		transition:
			transform 0.3s var(--ease-overshoot-linear),
			filter 0.2s var(--quad);
		-webkit-tap-highlight-color: transparent;
	}
	.ob__btn:hover {
		transform: scale(1.02);
		filter: brightness(0.97);
	}
	.ob__btn:active {
		transform: scale(0.96);
	}
	.ob__btn:focus-visible {
		outline: 2px solid var(--ink);
		outline-offset: 3px;
	}
	.ob__counter {
		margin: 12px 0 0;
		color: var(--muted);
		font: 500 12px/1 var(--text-font);
		letter-spacing: -0.12px;
	}

	@media screen and (max-width: 420px) {
		.ob {
			padding: 12px;
		}
		.ob__art {
			height: 210px;
		}
		.ob__body {
			padding: 20px 20px 16px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.ob__coin,
		.ob__content {
			animation: none;
		}
	}
</style>

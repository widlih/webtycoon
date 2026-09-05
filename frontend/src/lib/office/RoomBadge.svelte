<script lang="ts">
	import { Check, Coffee } from '@lucide/svelte';
	import Price from '$lib/landing/Price.svelte';

	let {
		title = '',
		remaining = 0,
		total = 0,
		ready = false,
		idle = false,
		reward = null,
		onclick
	}: {
		title?: string;
		remaining?: number;
		total?: number;
		ready?: boolean;
		idle?: boolean;
		reward?: { coins: number; xp: number } | null;
		onclick?: () => void;
	} = $props();

	const progress = $derived(total > 0 ? Math.min(1, Math.max(0, 1 - remaining / total)) : 1);
	const r = 9;
	const circumference = 2 * Math.PI * r;
	const minutes = $derived(Math.floor(Math.max(0, remaining) / 60000));
	const seconds = $derived(Math.ceil(Math.max(0, remaining) / 1000) % 60);
</script>

{#if idle}
	<div class="badge badge--idle" title="Свободен">
		<Coffee size={14} strokeWidth={2.25} />
	</div>
{:else if ready}
	<button type="button" class="badge badge--ready" {onclick}>
		<span class="badge__check"><Check size={12} strokeWidth={3} /></span>
		{#if reward}
			<Price value={reward.coins} prefix="+" />
		{:else}
			<span>Готово</span>
		{/if}
	</button>
{:else}
	<div class="badge badge--work" {title}>
		<svg class="badge__ring" viewBox="0 0 24 24" aria-hidden="true">
			<circle cx="12" cy="12" {r} fill="none" stroke="#ffffff33" stroke-width="3" />
			<circle
				cx="12"
				cy="12"
				{r}
				fill="none"
				stroke="#f5ff63"
				stroke-width="3"
				stroke-linecap="round"
				stroke-dasharray={circumference}
				stroke-dashoffset={circumference * (1 - progress)}
				transform="rotate(-90 12 12)"
			/>
		</svg>
		<span class="badge__time">{minutes}:{seconds.toString().padStart(2, '0')}</span>
	</div>
{/if}

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		max-width: 220px;
		padding: 6px 12px 6px 8px;
		border: 0;
		border-radius: 40px;
		background: #fff;
		color: var(--ink, #111);
		font: 600 13px/1 var(--display, system-ui);
		letter-spacing: -0.26px;
		box-shadow:
			0 2px 5px #0000000a,
			0 10px 10px #0000000a;
		animation: badge-in 360ms cubic-bezier(0.2, 0.9, 0.3, 1.2);
	}
	.badge--idle {
		width: 30px;
		height: 30px;
		padding: 0;
		justify-content: center;
		background: #f2f1f3;
		color: var(--muted, #97979b);
		box-shadow: none;
	}
	.badge--ready {
		background: #f5ff63;
		color: var(--ink, #111);
		cursor: pointer;
		padding: 6px 14px 6px 8px;
		animation:
			badge-in 360ms cubic-bezier(0.2, 0.9, 0.3, 1.2),
			badge-bounce 2.2s ease-in-out 0.4s infinite;
		transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}
	.badge--ready:hover {
		transform: scale(1.08);
	}
	.badge__check {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--ink, #111);
		color: #fff;
	}
	.badge--work {
		gap: 6px;
		padding: 5px 10px 5px 6px;
		background: var(--ink, #19171c);
		color: #fff;
		box-shadow: 0 6px 14px #19171c33;
	}
	.badge__ring {
		width: 18px;
		height: 18px;
		flex: none;
	}
	.badge__ring circle:last-child {
		transition: stroke-dashoffset 1s linear;
	}
	.badge__time {
		flex: none;
		font-variant-numeric: tabular-nums;
		font-size: 12px;
	}
	@keyframes badge-in {
		from {
			transform: translateY(8px) scale(0.85);
			opacity: 0;
		}
		to {
			transform: none;
			opacity: 1;
		}
	}
	@keyframes badge-bounce {
		0%,
		70%,
		100% {
			transform: translateY(0);
		}
		80% {
			transform: translateY(-7px);
		}
		90% {
			transform: translateY(-3px);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.badge,
		.badge--ready {
			animation: none;
		}
	}
</style>

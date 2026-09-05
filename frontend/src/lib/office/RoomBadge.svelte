<script lang="ts">
	let {
		title,
		remaining,
		total,
		ready
	}: {
		title: string;
		remaining: number;
		total: number;
		ready: boolean;
	} = $props();

	const progress = $derived(total > 0 ? Math.min(1, Math.max(0, 1 - remaining / total)) : 1);
	const r = 9;
	const circumference = 2 * Math.PI * r;
	const minutes = $derived(Math.floor(Math.max(0, remaining) / 60000));
	const seconds = $derived(Math.ceil(Math.max(0, remaining) / 1000) % 60);
</script>

<div class="badge" class:is-ready={ready}>
	<svg class="badge__ring" viewBox="0 0 24 24" aria-hidden="true">
		<circle
			cx="12"
			cy="12"
			{r}
			fill="none"
			stroke="currentColor"
			stroke-opacity="0.18"
			stroke-width="3"
		/>
		<circle
			cx="12"
			cy="12"
			{r}
			fill="none"
			stroke="currentColor"
			stroke-width="3"
			stroke-linecap="round"
			stroke-dasharray={circumference}
			stroke-dashoffset={circumference * (1 - progress)}
			transform="rotate(-90 12 12)"
		/>
	</svg>
	<span class="badge__title">{title}</span>
	<span class="badge__time"
		>{ready ? 'готово' : `${minutes}:${seconds.toString().padStart(2, '0')}`}</span
	>
</div>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		max-width: 220px;
		padding: 6px 12px 6px 8px;
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
	.badge__ring {
		width: 20px;
		height: 20px;
		flex: none;
		color: #a981ff;
		transition: stroke-dashoffset 1s linear;
	}
	.badge__title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.badge__time {
		flex: none;
		font-variant-numeric: tabular-nums;
		color: var(--secondary, #6b6b70);
	}
	.is-ready {
		background: #a981ff;
		color: #fff;
		animation: badge-pulse 1.4s ease-in-out infinite;
	}
	.is-ready .badge__ring,
	.is-ready .badge__time {
		color: #fff;
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
	@keyframes badge-pulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.06);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.badge,
		.is-ready {
			animation: none;
		}
	}
</style>

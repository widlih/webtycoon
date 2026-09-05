<script lang="ts">
	import { Users } from '@lucide/svelte';
	import type { WidgetProps } from '..';

	let { step, onaction }: WidgetProps = $props();

	const options = $derived(step.type === 'choose' ? step.options : []);
	const counts = [1240, 86, 310];
	let picked = $state<number | null>(null);
</script>

<div class="rs">
	<span class="rs__label">Кому отправить</span>
	<div class="rs__grid">
		{#each options as option, i (option)}
			<button
				class="rs__card"
				class:is-picked={picked === i}
				onclick={() => {
					picked = i;
					onaction({ kind: 'choose', value: i });
				}}
			>
				<span class="rs__icon"><Users size={16} strokeWidth={2.25} /></span>
				<span class="rs__name">{option}</span>
				<span class="rs__count">{counts[i] ?? 0} контактов</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.rs {
		display: grid;
		gap: 12px;
		font: 400 15px/140% var(--text-font);
		color: var(--ink);
		letter-spacing: -0.3px;
	}
	.rs__label {
		font: 400 14px/1 var(--text-font);
		color: var(--secondary);
	}

	.rs__grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: 8px;
	}
	.rs__card {
		display: grid;
		gap: 6px;
		justify-items: start;
		text-align: left;
		padding: 14px 16px;
		border: 0;
		border-radius: 16px;
		background: #fff;
		cursor: pointer;
		font: inherit;
		color: var(--ink);
		transition:
			background-color 0.2s var(--quad),
			color 0.2s var(--quad),
			transform 0.3s var(--ease-overshoot-linear);
	}
	.rs__card:hover {
		transform: scale(1.02);
	}
	.rs__card.is-picked {
		background: var(--ink);
		color: #fff;
	}
	.rs__icon {
		display: inline-flex;
		padding: 6px;
		border-radius: 8px;
		background: var(--gray);
		color: var(--ink);
	}
	.rs__card.is-picked .rs__icon {
		background: var(--yellow);
	}
	.rs__name {
		font-weight: 600;
	}
	.rs__count {
		color: var(--muted);
		font-size: 13px;
	}
	.rs__card.is-picked .rs__count {
		color: #ffffff8a;
	}
</style>

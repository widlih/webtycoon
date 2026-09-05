<script lang="ts">
	import { CalendarClock, SendHorizontal } from '@lucide/svelte';
	import type { WidgetProps } from '..';

	let { step, onaction }: WidgetProps = $props();

	const options = $derived(step.type === 'choose' ? step.options : []);
	const icons = [SendHorizontal, CalendarClock];
	let picked = $state<number | null>(null);
</script>

<div class="rs">
	<div class="rs__head">
		<span class="rs__title">Отправка рассылки</span>
		<span class="rs__muted">Получателей: 86</span>
	</div>
	<div class="rs__options">
		{#each options as option, i (option)}
			{@const Icon = icons[i] ?? SendHorizontal}
			<button
				class="rs__option"
				class:is-picked={picked === i}
				onclick={() => {
					picked = i;
					onaction({ kind: 'choose', value: i });
				}}
			>
				<Icon size={18} strokeWidth={2.25} />
				<span>{option}</span>
			</button>
		{/each}
	</div>
	{#if picked === 1}
		<div class="rs__schedule"><span>Вторник, 9 сентября</span><span>09:00</span></div>
	{/if}
</div>

<style>
	.rs {
		display: grid;
		gap: 12px;
		font: 400 15px/140% var(--text-font);
		color: var(--ink);
		letter-spacing: -0.3px;
	}
	.rs__title {
		font: 600 18px/1 var(--display);
		letter-spacing: -0.36px;
	}
	.rs__muted {
		color: var(--muted);
		font-size: 14px;
	}

	.rs__head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}
	.rs__options {
		display: grid;
		gap: 8px;
	}
	.rs__option {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		border: 0;
		border-radius: 16px;
		background: #fff;
		cursor: pointer;
		font: inherit;
		color: var(--ink);
		text-align: left;
		transition:
			background-color 0.2s var(--quad),
			color 0.2s var(--quad),
			transform 0.3s var(--ease-overshoot-linear);
	}
	.rs__option:hover {
		transform: scale(1.01);
	}
	.rs__option.is-picked {
		background: var(--ink);
		color: #fff;
		font-weight: 600;
	}
	.rs__schedule {
		display: flex;
		justify-content: space-between;
		padding: 12px 16px;
		border-radius: 14px;
		background: #fff;
		color: var(--secondary);
	}
</style>

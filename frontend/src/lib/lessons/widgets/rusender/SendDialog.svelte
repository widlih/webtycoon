<script lang="ts">
	import { CalendarClock, Check } from '@lucide/svelte';
	import type { WidgetProps } from '..';

	let { step, onaction }: WidgetProps = $props();

	const choose = $derived(step.type === 'choose' ? step : null);
	const options = $derived(choose?.options ?? []);
	const title = $derived(choose?.title ?? 'Отправка рассылки');
	const note = $derived(choose?.note ?? 'Получателей: 86');
	let picked = $state<number | null>(null);

	const isSchedule = (option: string) => /запланир/i.test(option);
</script>

<div class="rs">
	<div class="rs__head">
		<span class="rs__title">{title}</span>
		{#if note}<span class="rs__muted">{note}</span>{/if}
	</div>
	<div class="rs__options" role="radiogroup" aria-label={title}>
		{#each options as option, i (option)}
			<button
				class="rs__option"
				class:is-picked={picked === i}
				role="radio"
				aria-checked={picked === i}
				onclick={() => {
					picked = i;
					onaction({ kind: 'choose', value: i });
				}}
			>
				<span class="rs__radio" aria-hidden="true">
					{#if picked === i}<Check size={14} strokeWidth={3} />{/if}
				</span>
				<span class="rs__text">
					<span class="rs__name">{option}</span>
					{#if choose?.meta?.[i]}<span class="rs__meta">{choose.meta[i]}</span>{/if}
				</span>
				{#if isSchedule(option)}<CalendarClock size={18} strokeWidth={2.25} />{/if}
			</button>
		{/each}
	</div>
	{#if picked !== null && isSchedule(options[picked] ?? '')}
		<div class="rs__schedule">
			<span>Вторник, 9 сентября</span>
			<span>09:00 · Москва (UTC+3)</span>
		</div>
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
		gap: 12px;
		flex-wrap: wrap;
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
	}
	.rs__radio {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		border: 2px solid #c3c3c6;
		color: var(--ink);
		transition:
			border-color 0.2s var(--quad),
			background-color 0.2s var(--quad);
	}
	.rs__option.is-picked .rs__radio {
		border-color: var(--yellow);
		background: var(--yellow);
	}
	.rs__text {
		display: grid;
		gap: 2px;
		flex: 1;
		min-width: 0;
	}
	.rs__name {
		font-weight: 600;
	}
	.rs__meta {
		color: var(--muted);
		font-size: 13px;
	}
	.rs__option.is-picked .rs__meta {
		color: #ffffff8a;
	}
	.rs__schedule {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
		padding: 12px 16px;
		border-radius: 14px;
		background: #fff;
		color: var(--secondary);
	}
</style>

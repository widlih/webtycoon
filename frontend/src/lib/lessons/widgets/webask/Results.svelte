<script lang="ts">
	import { BarChart3, Download } from '@lucide/svelte';
	import type { WidgetProps } from '..';

	let { step, onaction }: WidgetProps = $props();

	const options = $derived(step.type === 'choose' ? step.options : []);
	const stats = [
		{ label: 'Открыли опрос', value: 100 },
		{ label: 'Ответили на первый вопрос', value: 91 },
		{ label: 'Дошли до открытого вопроса', value: 64 },
		{ label: 'Завершили', value: 58 }
	];
	let picked = $state<number | null>(null);
</script>

<div class="wg">
	<div class="wg__bar">
		<span class="wg__title">Результаты · 312 ответов</span>
		<div class="wg__actions">
			<button class="wg__btn" onclick={() => onaction({ kind: 'click', value: 'export:xlsx' })}>
				<Download size={14} strokeWidth={2.25} /> XLSX
			</button>
			<button class="wg__btn" onclick={() => onaction({ kind: 'click', value: 'export:pdf' })}>
				<Download size={14} strokeWidth={2.25} /> PDF
			</button>
		</div>
	</div>
	<div class="wg__panel">
		<div class="wg__bars">
			{#each stats as s (s.label)}
				<div class="wg__bar-row">
					<span>{s.label}</span>
					<span class="wg__muted">{s.value}%</span>
					<span class="wg__track"><span class="wg__fill" style="width:{s.value}%"></span></span>
				</div>
			{/each}
		</div>
	</div>
	{#if step.type === 'choose'}
		<div class="wg__grid">
			{#each options as option, i (option)}
				<button
					class="wg__card"
					class:is-picked={picked === i}
					onclick={() => {
						picked = i;
						onaction({ kind: 'choose', value: i });
					}}
				>
					<span class="wg__icon"><BarChart3 size={16} strokeWidth={2.25} /></span>
					<span class="wg__name">{option}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>

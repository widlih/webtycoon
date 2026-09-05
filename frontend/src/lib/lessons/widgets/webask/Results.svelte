<script lang="ts">
	import { BarChart3, Download, FileText, Gauge, Users } from '@lucide/svelte';
	import Choices from '../common/Choices.svelte';
	import type { WidgetProps } from '..';

	let { step, onaction }: WidgetProps = $props();

	const choose = $derived(step.type === 'choose' ? step : null);
	const title = $derived(choose?.title ?? 'Результаты · 312 ответов');
	const note = $derived(
		choose?.note ?? 'Статистика прохождения: сколько респондентов дошло до каждого вопроса'
	);
	/** Экран NPS вместо воронки, если урок про NPS */
	const isNps = $derived(/nps/i.test(title));

	const funnel = [
		{ label: 'Открыли опрос', value: 100 },
		{ label: 'Ответили на первый вопрос', value: 91 },
		{ label: 'Дошли до открытого вопроса', value: 64 },
		{ label: 'Завершили', value: 58 }
	];
	const nps = [
		{ label: 'Оценки 9–10', value: 54 },
		{ label: 'Оценки 7–8', value: 28 },
		{ label: 'Оценки 0–6', value: 18 }
	];

	const icons: Array<[RegExp, typeof BarChart3]> = [
		[/диапазон|текст/i, FileText],
		[/нейтрал|промоут|критик|9|7|0/i, Gauge],
		[/друг|курьер|возраст/i, Users]
	];
	const iconFor = (text: string) => icons.find(([re]) => re.test(text))?.[1] ?? BarChart3;

	let exported = $state<string | null>(null);
</script>

<div class="wg">
	<div class="wg__bar">
		<div class="wg__head">
			<span class="wg__title">{title}</span>
			<span class="wg__note">{note}</span>
		</div>
		<div class="wg__actions">
			<button
				type="button"
				class="wg__btn"
				class:wg__btn--primary={exported === 'xlsx'}
				onclick={() => {
					exported = 'xlsx';
					onaction({ kind: 'click', value: 'export:xlsx' });
				}}
			>
				<Download size={14} strokeWidth={2.25} /> XLSX
			</button>
			<button
				type="button"
				class="wg__btn"
				class:wg__btn--primary={exported === 'pdf'}
				onclick={() => {
					exported = 'pdf';
					onaction({ kind: 'click', value: 'export:pdf' });
				}}
			>
				<Download size={14} strokeWidth={2.25} /> PDF
			</button>
		</div>
	</div>

	<div class="wg__panel">
		{#if isNps}
			<div class="wg__kpi">
				<div class="wg__kpi-item">
					<span class="wg__kpi-value">36</span>
					<span class="wg__kpi-label">NPS · доля 9–10 минус доля 0–6</span>
				</div>
				<div class="wg__kpi-item">
					<span class="wg__kpi-value">312</span>
					<span class="wg__kpi-label">ответов за неделю</span>
				</div>
			</div>
		{/if}
		<div class="wg__bars">
			{#each isNps ? nps : funnel as s (s.label)}
				<div class="wg__bar-row">
					<span>{s.label}</span>
					<span class="wg__muted">{s.value}%</span>
					<span class="wg__track"><span class="wg__fill" style="width:{s.value}%"></span></span>
				</div>
			{/each}
		</div>
		{#if exported}
			<span class="wg__help"
				>Файл {exported.toUpperCase()} готов, скачивание начнётся в браузере.</span
			>
		{/if}
	</div>

	{#if choose}
		<Choices
			options={choose.options}
			meta={choose.meta ?? []}
			icon={iconFor}
			onpick={(i) => onaction({ kind: 'choose', value: i })}
		/>
	{/if}
</div>

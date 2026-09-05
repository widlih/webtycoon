<script lang="ts">
	import {
		AlignLeft,
		Calendar,
		CircleDot,
		Gauge,
		Grid3x3,
		ListChecks,
		SlidersHorizontal,
		Star,
		Upload
	} from '@lucide/svelte';
	import Choices from '../common/Choices.svelte';
	import type { WidgetProps } from '..';

	let { step, onaction }: WidgetProps = $props();

	const choose = $derived(step.type === 'choose' ? step : null);
	const title = $derived(choose?.title ?? 'Новый вопрос · Тип');
	const note = $derived(choose?.note ?? 'От типа зависит, как респондент будет отвечать');

	const icons: Array<[RegExp, typeof CircleDot]> = [
		[/nps/i, Gauge],
		[/шкал/i, SlidersHorizontal],
		[/матриц/i, Grid3x3],
		[/открыт|текст/i, AlignLeft],
		[/файл/i, Upload],
		[/дата/i, Calendar],
		[/рейтинг|звёзд/i, Star],
		[/нескольк/i, ListChecks]
	];
	const iconFor = (text: string) => icons.find(([re]) => re.test(text))?.[1] ?? CircleDot;
</script>

<div class="wg">
	<div class="wg__head">
		<span class="wg__title">{title}</span>
		<span class="wg__note">{note}</span>
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

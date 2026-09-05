<script lang="ts">
	import { Clock, FileText, Hand, ListChecks, Trophy } from '@lucide/svelte';
	import Choices from '../common/Choices.svelte';
	import type { WidgetProps } from '..';

	let { step, onaction }: WidgetProps = $props();

	const choose = $derived(step.type === 'choose' ? step : null);
	const title = $derived(choose?.title ?? 'Настройки опроса');
	const note = $derived(choose?.note ?? 'Общие параметры: название, экраны и правила прохождения');

	const icons: Array<[RegExp, typeof ListChecks]> = [
		[/зачем|врем|минут/i, Clock],
		[/приветств/i, Hand],
		[/балл|тест|диапазон/i, Trophy],
		[/список|текст|правил/i, FileText]
	];
	const iconFor = (text: string) => icons.find(([re]) => re.test(text))?.[1] ?? ListChecks;
</script>

<div class="wg">
	<div class="wg__head">
		<span class="wg__title">{title}</span>
		<span class="wg__note">{note}</span>
	</div>
	<div class="wg__panel">
		<label class="wg__field">
			<span class="wg__label">Название опроса</span>
			<input class="wg__input" value="Оценка доставки · сентябрь" disabled />
			<span class="wg__help">Видно только вам в списке опросов, респондентам не показывается.</span>
		</label>
		{#if choose}
			<Choices
				options={choose.options}
				meta={choose.meta ?? []}
				icon={iconFor}
				onpick={(i) => onaction({ kind: 'choose', value: i })}
			/>
		{/if}
	</div>
</div>

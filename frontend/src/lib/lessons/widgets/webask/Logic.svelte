<script lang="ts">
	import {
		CornerDownRight,
		Eye,
		GitBranch,
		Heart,
		Plus,
		RotateCcw,
		Send,
		Trash2
	} from '@lucide/svelte';
	import Choices from '../common/Choices.svelte';
	import type { WidgetProps } from '..';

	let { step, onaction }: WidgetProps = $props();

	const choose = $derived(step.type === 'choose' ? step : null);
	const title = $derived(choose?.title ?? 'Логические ветвления');
	const note = $derived(
		choose?.note ??
			'Правило из двух частей: ЕСЛИ условие по ответу, ТО действие: перейти, показать или скрыть вопрос, завершить анкету'
	);

	const icons: Array<[RegExp, typeof CornerDownRight]> = [
		[/благодарн|заверш/i, Heart],
		[/пройти|предпросмотр|самому/i, Eye],
		[/разослать|отправить/i, Send],
		[/удалить/i, Trash2],
		[/заново|снова/i, RotateCcw]
	];
	const iconFor = (text: string) => icons.find(([re]) => re.test(text))?.[1] ?? CornerDownRight;

	let added = $state(false);
</script>

<div class="wg">
	<div class="wg__bar">
		<div class="wg__head">
			<span class="wg__title">{title}</span>
			<span class="wg__note">{note}</span>
		</div>
		<button
			type="button"
			class="wg__btn wg__btn--primary"
			onclick={() => {
				added = true;
				onaction({ kind: 'click', value: 'addRule' });
			}}><Plus size={14} strokeWidth={2.5} /> Добавить правило</button
		>
	</div>
	<div class="wg__panel">
		<div class="wg__bar">
			<span
				><GitBranch size={14} strokeWidth={2.25} /> Вопрос 2 · «Пользуетесь ли вы приложением?»</span
			>
			<span class="wg__tag" class:wg__tag--on={added || Boolean(choose)}
				>{added || choose ? 'Условие добавлено' : 'Без логики'}</span
			>
		</div>
		<span class="wg__muted">ЕСЛИ ответ равен «Нет» · ТО выполнить действие:</span>
		{#if choose}
			<Choices
				options={choose.options}
				meta={choose.meta ?? []}
				icon={iconFor}
				onpick={(i) => onaction({ kind: 'choose', value: i })}
			/>
		{:else}
			<span class="wg__zone">Выберите вопрос или экран для перехода</span>
		{/if}
	</div>
</div>

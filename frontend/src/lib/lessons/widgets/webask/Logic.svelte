<script lang="ts">
	import { CornerDownRight, GitBranch, Plus } from '@lucide/svelte';
	import type { WidgetProps } from '..';

	let { step, onaction }: WidgetProps = $props();

	const options = $derived(step.type === 'choose' ? step.options : []);
	let picked = $state<number | null>(null);
	let added = $state(false);
</script>

<div class="wg">
	<div class="wg__bar">
		<span class="wg__title">Логические ветвления</span>
		<button
			class="wg__btn wg__btn--primary"
			onclick={() => {
				added = true;
				onaction({ kind: 'click', value: 'addRule' });
			}}><Plus size={14} strokeWidth={2.5} /> Добавить переход по условию</button
		>
	</div>
	<div class="wg__panel">
		<div class="wg__bar">
			<span
				><GitBranch size={14} strokeWidth={2.25} /> Вопрос 2 · «Пользуетесь ли вы мобильным приложением?»</span
			>
			<span class="wg__tag" class:wg__tag--on={added || step.type === 'choose'}
				>{added || step.type === 'choose' ? 'Условие добавлено' : 'Без логики'}</span
			>
		</div>
		<span class="wg__muted">Если ответ равен «Нет», то перейти к:</span>
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
						<span class="wg__icon"><CornerDownRight size={16} strokeWidth={2.25} /></span>
						<span class="wg__name">{option}</span>
					</button>
				{/each}
			</div>
		{:else}
			<span class="wg__zone">Выберите вопрос или экран для перехода</span>
		{/if}
	</div>
</div>

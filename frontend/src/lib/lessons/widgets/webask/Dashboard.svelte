<script lang="ts">
	import { LayoutTemplate, Plus } from '@lucide/svelte';
	import type { WidgetProps } from '..';

	let { onaction }: WidgetProps = $props();

	const rows = [
		{ name: 'Оценка доставки · август', status: 'Активен', answers: 312 },
		{ name: 'Анкета для новых сотрудников', status: 'Черновик', answers: 0 },
		{ name: 'NPS после заказа', status: 'Завершён', answers: 1048 }
	];
</script>

<div class="wg">
	<div class="wg__bar">
		<span class="wg__title">Мои опросы</span>
		<div class="wg__actions">
			<button class="wg__btn" onclick={() => onaction({ kind: 'click', value: 'templates' })}>
				<LayoutTemplate size={14} strokeWidth={2.25} /> Шаблоны
			</button>
			<button
				class="wg__btn wg__btn--primary"
				onclick={() => onaction({ kind: 'click', value: 'create' })}
			>
				<Plus size={14} strokeWidth={2.5} /> Создать опрос
			</button>
		</div>
	</div>
	<ul class="wg__list">
		{#each rows as row (row.name)}
			<li class="wg__row">
				<span>{row.name}</span>
				<span class="wg__tag" class:wg__tag--on={row.status === 'Активен'}>{row.status}</span>
				<span class="wg__muted">{row.answers} ответов</span>
			</li>
		{/each}
	</ul>
</div>

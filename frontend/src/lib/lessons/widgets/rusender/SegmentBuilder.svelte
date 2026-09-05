<script lang="ts">
	import { Filter, Plus } from '@lucide/svelte';
	import type { WidgetProps } from '..';

	let { step, onaction }: WidgetProps = $props();

	const choose = $derived(step.type === 'choose' ? step : null);
	const options = $derived(choose?.options ?? []);
	const title = $derived(choose?.title ?? 'Контакты · Сегменты');
	const note = $derived(
		choose?.note ?? 'Новый сегмент · список «Подписчики сайта» · 1 240 контактов'
	);
	let picked = $state<number | null>(null);
</script>

<div class="wg">
	<div class="wg__bar">
		<span class="wg__title">{title}</span>
		<button
			class="wg__btn wg__btn--primary"
			onclick={() => onaction({ kind: 'click', value: 'add' })}
		>
			<Plus size={14} strokeWidth={2.5} /> Добавить сегмент
		</button>
	</div>
	<div class="wg__panel">
		<span class="wg__label">{note}</span>
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
					<span class="wg__icon"><Filter size={16} strokeWidth={2.25} /></span>
					<span class="wg__name">{option}</span>
					{#if choose?.meta?.[i]}<span class="wg__muted">{choose.meta[i]}</span>{/if}
				</button>
			{/each}
		</div>
	</div>
</div>

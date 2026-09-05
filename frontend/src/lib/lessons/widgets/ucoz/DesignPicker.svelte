<script lang="ts">
	import type { WidgetProps } from '..';

	let { step, onaction }: WidgetProps = $props();

	const choose = $derived(step.type === 'choose' ? step : null);
	const options = $derived(choose?.options ?? []);
	const title = $derived(choose?.title ?? 'Дизайн · Выбрать дизайн');
	const note = $derived(
		choose?.note ??
			'Шаблон задаёт внешний вид всех страниц сразу, поменять его можно в любой момент'
	);
	const palettes = ['#b593ff', '#50b8ff', '#ff9a3d', '#3ccf7a'];
	let picked = $state<number | null>(null);
</script>

<div class="wg">
	<div class="wg__head">
		<span class="wg__title">{title}</span>
		<span class="wg__note">{note}</span>
	</div>
	<div class="wg__grid" role="radiogroup">
		{#each options as option, i (option)}
			<button
				type="button"
				class="wg__card"
				class:is-picked={picked === i}
				role="radio"
				aria-checked={picked === i}
				onclick={() => {
					picked = i;
					onaction({ kind: 'choose', value: i });
				}}
			>
				<span class="wg__preview" style="width:100%">
					<span class="wg__swatch" style="background:{palettes[i % palettes.length]}"></span>
					<span style="height:6px;border-radius:3px;background:#fff;width:70%"></span>
					<span style="height:6px;border-radius:3px;background:#fff;width:45%"></span>
				</span>
				<span class="wg__name">{option}</span>
				{#if choose?.meta?.[i]}<span class="wg__muted">{choose.meta[i]}</span>{/if}
			</button>
		{/each}
	</div>
</div>

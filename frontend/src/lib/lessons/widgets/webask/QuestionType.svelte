<script lang="ts">
	import {
		AlignLeft,
		CircleDot,
		Gauge,
		Grid3x3,
		ListChecks,
		SlidersHorizontal,
		Star
	} from '@lucide/svelte';
	import type { WidgetProps } from '..';

	let { step, onaction }: WidgetProps = $props();

	const options = $derived(step.type === 'choose' ? step.options : []);
	const icons = [CircleDot, ListChecks, SlidersHorizontal, Gauge, Grid3x3, AlignLeft, Star];
	let picked = $state<number | null>(null);
</script>

<div class="wg">
	<span class="wg__title">Добавить вопрос</span>
	<div class="wg__grid">
		{#each options as option, i (option)}
			{@const Icon = icons[i % icons.length]}
			<button
				class="wg__card"
				class:is-picked={picked === i}
				onclick={() => {
					picked = i;
					onaction({ kind: 'choose', value: i });
				}}
			>
				<span class="wg__icon"><Icon size={16} strokeWidth={2.25} /></span>
				<span class="wg__name">{option}</span>
			</button>
		{/each}
	</div>
</div>

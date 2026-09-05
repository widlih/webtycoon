<script lang="ts">
	import type { WidgetProps } from '..';

	let { step, onaction }: WidgetProps = $props();

	const options = $derived(step.type === 'choose' ? step.options : []);
	const palettes = ['#b593ff', '#50b8ff', '#ff9a3d', '#3ccf7a'];
	let picked = $state<number | null>(null);
</script>

<div class="wg">
	<span class="wg__title">Дизайн · Выбрать дизайн</span>
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
				<span class="wg__preview" style="width:100%">
					<span class="wg__swatch" style="background:{palettes[i % palettes.length]}"></span>
					<span style="height:6px;border-radius:3px;background:#fff;width:70%"></span>
					<span style="height:6px;border-radius:3px;background:#fff;width:45%"></span>
				</span>
				<span class="wg__name">{option}</span>
			</button>
		{/each}
	</div>
</div>

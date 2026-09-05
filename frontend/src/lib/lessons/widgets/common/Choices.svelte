<script lang="ts">
	import { CircleDot } from '@lucide/svelte';

	type Icon = typeof CircleDot;

	let {
		options,
		meta = [],
		icon = () => CircleDot,
		onpick
	}: {
		options: string[];
		meta?: string[];
		/** Иконка для варианта: по тексту или по индексу */
		icon?: (option: string, index: number) => Icon;
		onpick: (index: number) => void;
	} = $props();

	let picked = $state<number | null>(null);
</script>

<div class="wg__grid" role="radiogroup">
	{#each options as option, i (option)}
		{@const Icon = icon(option, i)}
		<button
			type="button"
			class="wg__card"
			class:is-picked={picked === i}
			role="radio"
			aria-checked={picked === i}
			onclick={() => {
				picked = i;
				onpick(i);
			}}
		>
			<span class="wg__icon"><Icon size={16} strokeWidth={2.25} /></span>
			<span class="wg__name">{option}</span>
			{#if meta[i]}<span class="wg__muted">{meta[i]}</span>{/if}
		</button>
	{/each}
</div>

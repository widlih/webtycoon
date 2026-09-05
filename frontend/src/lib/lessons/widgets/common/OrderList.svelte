<script lang="ts">
	import { ChevronDown, ChevronUp } from '@lucide/svelte';
	import type { WidgetProps } from '..';

	let { step, onaction, wrong }: WidgetProps = $props();

	const items = $derived(step.type === 'order' ? step.items : []);
	let order = $state<number[]>([]);

	$effect(() => {
		const n = items.length;
		order = items.map((_, i) => i).sort((a, b) => ((a * 7 + 3) % n) - ((b * 7 + 3) % n));
	});

	function move(from: number, to: number) {
		if (to < 0 || to >= order.length) return;
		const next = [...order];
		[next[from], next[to]] = [next[to], next[from]];
		order = next;
		onaction({ kind: 'order', value: order });
	}
</script>

<div class="wg">
	<span class="wg__label">Расставьте шаги в правильном порядке</span>
	<ul class="wg__list">
		{#each order as idx, pos (idx)}
			<li class="wg__order" class:is-wrong={wrong}>
				<span class="wg__num">{pos + 1}</span>
				<span>{items[idx]}</span>
				<span class="wg__arrows">
					<button
						class="wg__arrow"
						aria-label="Выше"
						disabled={pos === 0}
						onclick={() => move(pos, pos - 1)}><ChevronUp size={16} strokeWidth={2.5} /></button
					>
					<button
						class="wg__arrow"
						aria-label="Ниже"
						disabled={pos === order.length - 1}
						onclick={() => move(pos, pos + 1)}><ChevronDown size={16} strokeWidth={2.5} /></button
					>
				</span>
			</li>
		{/each}
	</ul>
</div>

<style>
	.wg__order.is-wrong {
		box-shadow: inset 0 0 0 1px #fd3456;
	}
</style>

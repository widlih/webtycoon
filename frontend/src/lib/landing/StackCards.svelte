<script lang="ts">
	import { onMount } from 'svelte';

	type Card = {
		color: 'gray' | 'blue' | 'violet';
		title: string;
		text: string;
		label?: string;
		big?: string;
	};

	let { cards }: { cards: Card[] } = $props();

	let items: HTMLLIElement[] = $state([]);
	let cardHeight = $state(0);
	let disabled = $state(false);
	let viewport = $state(0);

	function measure() {
		viewport = window.innerHeight;
		cardHeight = 0;
		requestAnimationFrame(() => {
			const h = Math.max(...items.filter(Boolean).map((el) => el.offsetHeight));
			cardHeight = h;
			disabled = h > viewport;
		});
	}

	onMount(() => {
		document.fonts.ready.then(measure);
		window.addEventListener('resize', measure);
		return () => window.removeEventListener('resize', measure);
	});

	const count = $derived(cards.length);
	const active = $derived(cardHeight > 0 && !disabled);
	const top = (i: number) => (active ? (viewport - cardHeight) / 2 + i * 25 : 0);
</script>

<ul class="lp-stack__list">
	{#each cards as card, i (card.title)}
		<li
			class="lp-card lp-card--{card.color}"
			bind:this={items[i]}
			style:position={top(i) > 0 ? 'sticky' : undefined}
			style:top="{top(i)}px"
			style:height={active && top(i) > 0 ? `${cardHeight}px` : 'auto'}
			style:margin-bottom={active && top(i) > 0 ? `${(count - i) * 25}px` : '0'}
		>
			<div class="lp-card__header" aria-hidden="true">
				{#if card.big}
					<span class="lp-card__big">{card.big}</span>
				{:else if card.label}
					<span class="lp-card__label">{card.label}</span>
				{/if}
			</div>
			<div class="lp-card__content">
				<h3 class="lp-card__title">{card.title}</h3>
				<p class="lp-card__desc">{card.text}</p>
			</div>
		</li>
		{#if i < count - 1}
			<div style:height="{active ? 80 - (count - i) * 25 : 80}px"></div>
		{/if}
	{/each}
</ul>

<script lang="ts">
	let { cards }: { cards: { title: string; text: string; big: string; tag?: string }[] } = $props();
</script>

<div class="lp-container lp-grid">
	<div class="lp-features__inner">
		{#each cards as card (card.title)}
			<div class="lp-fcard">
				<div class="lp-fcard__header"><p class="lp-fcard__big">{card.big}</p></div>
				<div class="lp-fcard__content">
					{#if card.tag}<span class="lp-fcard__tag">{card.tag}</span>{/if}
					<h3 class="lp-fcard__title">{card.title}</h3>
					<p class="lp-fcard__desc">{card.text}</p>
				</div>
			</div>
		{/each}
	</div>
</div>

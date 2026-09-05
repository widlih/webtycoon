<script lang="ts">
	let {
		cards
	}: {
		cards: {
			title: string;
			text: string;
			big: string;
			tag?: string;
			art?: string | string[];
			artLayout?: 'fan';
			artAlign?: 'right' | 'center';
		}[];
	} = $props();
</script>

<div class="lp-container lp-grid">
	<div class="lp-features__inner">
		{#each cards as card (card.title)}
			<div class="lp-fcard">
				<div class="lp-fcard__header">
					<p class="lp-fcard__big">{card.big}</p>
					{#if card.art}
						<div class="lp-fcard__stage" aria-hidden="true">
							{#if Array.isArray(card.art)}
								<div class="lp-fcard__pile lp-fcard__pile--{card.artLayout ?? 'fan'}">
									{#each card.art as src (src)}
										<img {src} alt="" loading="lazy" />
									{/each}
								</div>
							{:else}
								<img
									class="lp-fcard__art lp-fcard__art--{card.artAlign ?? 'right'}"
									src={card.art}
									alt=""
									loading="lazy"
								/>
							{/if}
						</div>
					{/if}
				</div>
				<div class="lp-fcard__content">
					{#if card.tag}<span class="lp-fcard__tag">{card.tag}</span>{/if}
					<h3 class="lp-fcard__title">{card.title}</h3>
					<p class="lp-fcard__desc">{card.text}</p>
				</div>
			</div>
		{/each}
	</div>
</div>

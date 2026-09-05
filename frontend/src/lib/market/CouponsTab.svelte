<script lang="ts">
	import MarketCard from '$lib/market/MarketCard.svelte';
	import Button from '$lib/landing/Button.svelte';
	import Price from '$lib/landing/Price.svelte';
	import { useMutation, useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';
	import { PRODUCT_TITLES, PRODUCTS } from '../../convex/model/constants';

	const me = useQuery(api.players.me, {});
	const templates = useQuery(api.coupons.templates, {});
	const buy = useMutation(api.coupons.buy);

	let confirming = $state<string | null>(null);
	let error = $state('');
	let busy = $state(false);
	let lastCode = $state<{ slug: string; code: string } | null>(null);

	const premium = $derived(me.data?.premium ?? 0);
	const groups = $derived(
		PRODUCTS.map((p) => ({
			slug: p,
			title: PRODUCT_TITLES[p],
			templates: templates.data?.filter((t) => t.product === p) ?? []
		})).filter((g) => g.templates.length > 0)
	);

	async function purchase(slug: string) {
		confirming = null;
		error = '';
		busy = true;
		try {
			const result = await buy({ templateSlug: slug });
			lastCode = { slug, code: result.code };
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			busy = false;
		}
	}
</script>

{#each groups as group (group.slug)}
	<h2 class="mk-h">{group.title}</h2>
	<div class="mk-grid">
		{#each group.templates as t (t.slug)}
			{@const affordable = premium >= t.price}
			<MarketCard
				title={t.title}
				image={`/img/coupons/${t.product}.webp`}
				big={t.discount}
				text="Скидка {t.discount} · действует {t.ttlDays} дней"
				price={confirming === t.slug ? undefined : t.price}
				currency="premium"
				disabled={busy || !affordable}
				class="mk-card--figure"
				onbuy={() => (confirming = t.slug)}
			>
				{#if lastCode?.slug === t.slug}
					<span class="mk-code">{lastCode.code}</span>
				{/if}
				{#snippet foot()}
					{#if confirming === t.slug}
						<p class="mk-card__hint">
							Списать <Price value={t.price} kind="premium" />, останется <Price
								value={premium - t.price}
								kind="premium"
							/>
						</p>
						<div class="mk-card__row">
							<Button color="gray" size="small" onclick={() => (confirming = null)}>Отмена</Button>
							<Button color="black" size="small" disabled={busy} onclick={() => purchase(t.slug)}>
								Купить
							</Button>
						</div>
					{/if}
				{/snippet}
			</MarketCard>
		{/each}
	</div>
{/each}
{#if error}
	<p class="app-error mk-note">{error}</p>
{/if}

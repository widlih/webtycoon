<script lang="ts">
	import MarketCard from '$lib/market/MarketCard.svelte';
	import { useMutation, useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';
	import { OFFICE_TIERS } from '../../convex/model/constants';

	const me = useQuery(api.players.me, {});
	const office = useQuery(api.office.state, {});
	const upgrade = useMutation(api.office.upgrade);

	let error = $state('');
	let busy = $state(false);

	const coins = $derived(me.data?.coins ?? 0);
	const currentTier = $derived(office.data?.office.tier ?? 1);
	const tiers = $derived(OFFICE_TIERS.filter((t) => t.tier > currentTier));

	async function buy(tier: number) {
		error = '';
		busy = true;
		try {
			await upgrade({ tier });
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			busy = false;
		}
	}
</script>

<div class="mk-grid">
	{#each tiers as tier (tier.tier)}
		{@const next = tier.tier === currentTier + 1}
		{@const affordable = coins >= tier.price}
		<MarketCard
			title={tier.title}
			big={`${tier.hexCapacity}`}
			text="{tier.hexCapacity} гексов, {tier.slotsPerRoom} слотов в комнате"
			price={next ? tier.price : undefined}
			disabled={busy || !affordable}
			hint={next ? undefined : `После ${OFFICE_TIERS.find((t) => t.tier === tier.tier - 1)?.title}`}
			class={next ? '' : 'mk-card--done'}
			onbuy={() => buy(tier.tier)}
		/>
	{/each}
</div>
{#if tiers.length === 0}
	<p class="app-muted mk-note">Это максимальный офис.</p>
{/if}
{#if error}
	<p class="app-error mk-note">{error}</p>
{/if}

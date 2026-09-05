<script lang="ts">
	import MarketCard from '$lib/market/MarketCard.svelte';
	import { useMutation, useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';
	import type { Doc } from '../../convex/_generated/dataModel';

	const me = useQuery(api.players.me, {});
	const office = useQuery(api.office.state, {});
	const buy = useMutation(api.office.buy);

	let error = $state('');
	let busy = $state(false);

	const pictures = new Set([
		'monitor-2',
		'coffee-machine',
		'ficus',
		'monstera',
		'poster-launch',
		'poster-metrics',
		'chair-ergo',
		'lamp-arc',
		'rug-round',
		'bone'
	]);
	const picture = (slug: string) => (pictures.has(slug) ? `/img/items/${slug}.webp` : undefined);

	const coins = $derived(me.data?.coins ?? 0);
	const level = $derived(me.data?.level ?? 1);

	function describe(item: Doc<'items'>) {
		const effect = item.effect as { speed?: number; reward?: number };
		const parts: string[] = [];
		if (effect.speed) parts.push(`заказы на ${Math.round(effect.speed * 100)}% быстрее`);
		if (effect.reward) parts.push(`награда +${Math.round(effect.reward * 100)}%`);
		return parts.join(' · ');
	}

	const sorted = $derived(
		[...(office.data?.catalog ?? [])].sort((a, b) => {
			const kind = (i: Doc<'items'>) => {
				const e = i.effect as { speed?: number; reward?: number };
				return e.speed ? 0 : e.reward ? 1 : 2;
			};
			const value = (i: Doc<'items'>) => {
				const e = i.effect as { speed?: number; reward?: number };
				return e.speed ?? e.reward ?? 0;
			};
			return kind(a) - kind(b) || value(a) - value(b) || a.price - b.price;
		})
	);

	async function buyOne(item: Doc<'items'>) {
		error = '';
		busy = true;
		try {
			await buy({ itemSlug: item.slug });
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			busy = false;
		}
	}
</script>

<div class="mk-grid">
	{#each sorted as item (item.slug)}
		{@const affordable = coins >= item.price}
		{@const unlocked = level >= item.unlockLevel}
		<MarketCard
			title={item.name}
			image={picture(item.slug)}
			big={item.name}
			text={describe(item)}
			price={item.price}
			disabled={busy || !affordable || !unlocked}
			corner={unlocked ? undefined : `С ${item.unlockLevel} уровня`}
			class="{unlocked ? '' : 'mk-card--locked'} {picture(item.slug) ? 'mk-card--figure' : ''}"
			onbuy={() => buyOne(item)}
		/>
	{/each}
</div>
{#if error}
	<p class="app-error mk-note">{error}</p>
{/if}

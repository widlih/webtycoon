<script lang="ts">
	import MarketCard from '$lib/market/MarketCard.svelte';
	import { useMutation, useQuery } from 'convex-svelte';
	import { onMount } from 'svelte';
	import { api } from '../../convex/_generated/api';

	const me = useQuery(api.players.me, {});
	const data = useQuery(api.boosts.list, {});
	const buy = useMutation(api.boosts.buy);

	let error = $state('');
	let busy = $state('');
	let now = $state(Date.now());

	onMount(() => {
		const id = setInterval(() => (now = Date.now()), 1000);
		return () => clearInterval(id);
	});

	const coins = $derived(me.data?.coins ?? 0);

	function status(kind: string): string | null {
		if (!data.data) return null;
		if (kind === 'freelancer' && data.data.freelancerUntil && data.data.freelancerUntil > now) {
			const left = Math.ceil((data.data.freelancerUntil - now) / 60000);
			return `Действует ещё ${left} мин`;
		}
		if (kind === 'bonus' && data.data.bonusPending) return 'Ждёт следующего заказа';
		if (kind === 'energy' && (me.data?.energy ?? 0) >= (me.data?.energyMax ?? 8))
			return 'Энергия полная';
		return null;
	}

	const sorted = $derived(
		[...(data.data?.boosts ?? [])].sort(
			(a, b) => Number(coins < a.price) - Number(coins < b.price) || a.price - b.price
		)
	);

	async function purchase(slug: string) {
		error = '';
		busy = slug;
		try {
			await buy({ slug });
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			busy = '';
		}
	}
</script>

<div class="mk-grid">
	{#each sorted as b (b.slug)}
		{@const state = status(b.kind)}
		{@const affordable = coins >= b.price}
		<MarketCard
			title={b.title}
			big={b.title}
			text={b.description}
			price={state ? undefined : b.price}
			disabled={busy === b.slug || !affordable}
			hint={state ?? undefined}
			onbuy={() => purchase(b.slug)}
		/>
	{/each}
</div>
{#if error}
	<p class="app-error mk-note">{error}</p>
{/if}

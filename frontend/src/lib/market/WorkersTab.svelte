<script lang="ts">
	import MarketCard from '$lib/market/MarketCard.svelte';
	import { portrait } from '$lib/market/people';
	import { useMutation, useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';
	import type { Doc } from '../../convex/_generated/dataModel';

	const me = useQuery(api.players.me, {});
	const office = useQuery(api.office.state, {});
	const hire = useMutation(api.office.hire);

	let error = $state('');
	let busy = $state(false);

	const coins = $derived(me.data?.coins ?? 0);

	const sorted = $derived(
		[...(office.data?.workers ?? [])].sort(
			(a, b) => Number(coins < a.price) - Number(coins < b.price) || a.price - b.price
		)
	);

	async function hireOne(worker: Doc<'workers'>) {
		error = '';
		busy = true;
		try {
			await hire({ workerSlug: worker.slug });
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			busy = false;
		}
	}
</script>

<p class="app-muted mk-note" style="margin-top:0;margin-bottom:20px">
	Нанятый сотрудник появится в инвентаре на сцене офиса, перетащите его на свободный стол.
</p>
<div class="mk-grid">
	{#each sorted as w (w.slug)}
		{@const affordable = coins >= w.price}
		<MarketCard
			title={w.name}
			image={portrait(w.slug)}
			big={w.name.charAt(0)}
			class={portrait(w.slug) ? 'mk-card--figure' : ''}
			text={`${w.speed > 0 ? `Заказы на ${Math.round(w.speed * 100)}% быстрее` : 'Без бонуса'} · зарплата ${w.salary ?? 0} в день`}
			price={w.price}
			disabled={busy || !affordable}
			onbuy={() => hireOne(w)}
		/>
	{/each}
</div>
{#if (office.data?.workers.length ?? 0) === 0 && office.data}
	<p class="app-muted mk-note">Все сотрудники уже наняты.</p>
{/if}
{#if error}
	<p class="app-error mk-note">{error}</p>
{/if}

<script lang="ts">
	import MarketCard from '$lib/market/MarketCard.svelte';
	import RoomPicker from '$lib/components/RoomPicker.svelte';
	import { useMutation, useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';
	import type { Doc } from '../../convex/_generated/dataModel';
	import type { RoomView } from '../../convex/office';

	const me = useQuery(api.players.me, {});
	const office = useQuery(api.office.state, {});
	const hire = useMutation(api.office.hire);

	let picking = $state<Doc<'workers'> | null>(null);
	let error = $state('');
	let busy = $state(false);

	const coins = $derived(me.data?.coins ?? 0);
	const emptyRooms = $derived(office.data?.rooms.filter((r) => !r.worker) ?? []);

	const sorted = $derived(
		[...(office.data?.workers ?? [])].sort(
			(a, b) => Number(coins < a.price) - Number(coins < b.price) || a.price - b.price
		)
	);

	async function place(worker: Doc<'workers'>, room: RoomView) {
		picking = null;
		error = '';
		busy = true;
		try {
			await hire({ roomId: room._id, workerSlug: worker.slug });
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			busy = false;
		}
	}
</script>

{#if emptyRooms.length === 0}
	<p class="app-muted mk-note" style="margin-top:0;margin-bottom:20px">
		Свободных комнат нет: сначала откройте комнату в офисе.
	</p>
{/if}
<div class="mk-grid">
	{#each sorted as w (w.slug)}
		{@const affordable = coins >= w.price}
		<MarketCard
			title={w.name}
			big={w.name.charAt(0)}
			text={w.speed > 0 ? `Заказы на ${Math.round(w.speed * 100)}% быстрее` : 'Без бонуса'}
			price={w.price}
			disabled={busy || !affordable || emptyRooms.length === 0}
			onbuy={() => (picking = w)}
		/>
	{/each}
</div>
{#if (office.data?.workers.length ?? 0) === 0 && office.data}
	<p class="app-muted mk-note">Все сотрудники уже наняты.</p>
{/if}
{#if error}
	<p class="app-error mk-note">{error}</p>
{/if}

{#if picking}
	<RoomPicker
		title="{picking.name}: в какую комнату?"
		rooms={emptyRooms}
		onpick={(room) => place(picking!, room)}
		onclose={() => (picking = null)}
	/>
{/if}

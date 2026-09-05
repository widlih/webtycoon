<script lang="ts">
	import MarketCard from '$lib/market/MarketCard.svelte';
	import RoomPicker from '$lib/components/RoomPicker.svelte';
	import { useMutation, useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';
	import type { Doc } from '../../convex/_generated/dataModel';
	import type { RoomView } from '../../convex/office';

	const me = useQuery(api.players.me, {});
	const office = useQuery(api.office.state, {});
	const buy = useMutation(api.office.buy);

	let picking = $state<Doc<'items'> | null>(null);
	let error = $state('');
	let busy = $state(false);

	const coins = $derived(me.data?.coins ?? 0);
	const level = $derived(me.data?.level ?? 1);

	function freeSlot(room: RoomView) {
		return office.data?.slots.find((s) => !room.items.some((i) => i.slotId === s.id));
	}

	const roomsWithSpace = $derived(
		office.data?.rooms.filter((room) => Boolean(freeSlot(room))) ?? []
	);

	function describe(item: Doc<'items'>) {
		const effect = item.effect as { speed?: number; reward?: number };
		const parts: string[] = [];
		if (effect.speed) parts.push(`заказы на ${Math.round(effect.speed * 100)}% быстрее`);
		if (effect.reward) parts.push(`награда +${Math.round(effect.reward * 100)}%`);
		return parts.join(' · ');
	}

	const sorted = $derived(
		[...(office.data?.catalog ?? [])].sort((a, b) => {
			const rank = (i: Doc<'items'>) => (level < i.unlockLevel ? 2 : coins < i.price ? 1 : 0);
			return rank(a) - rank(b) || a.unlockLevel - b.unlockLevel || a.price - b.price;
		})
	);

	async function install(item: Doc<'items'>, room: RoomView) {
		const slot = freeSlot(room);
		picking = null;
		if (!slot) return;
		error = '';
		busy = true;
		try {
			await buy({ roomId: room._id, slotId: slot.id, itemSlug: item.slug });
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			busy = false;
		}
	}
</script>

{#if office.data && roomsWithSpace.length === 0}
	<p class="app-muted mk-note" style="margin-top:0;margin-bottom:20px">
		Свободных слотов нет: откройте комнату или следующий офис.
	</p>
{/if}
<div class="mk-grid">
	{#each sorted as item (item.slug)}
		{@const affordable = coins >= item.price}
		{@const unlocked = level >= item.unlockLevel}
		<MarketCard
			title={item.name}
			big={item.name}
			text={describe(item)}
			price={item.price}
			disabled={busy || !affordable || !unlocked || roomsWithSpace.length === 0}
			corner={unlocked ? undefined : `С ${item.unlockLevel} уровня`}
			class={unlocked ? '' : 'mk-card--locked'}
			onbuy={() => (picking = item)}
		/>
	{/each}
</div>
{#if error}
	<p class="app-error mk-note">{error}</p>
{/if}

{#if picking}
	<RoomPicker
		title="{picking.name}: в какую комнату?"
		rooms={roomsWithSpace}
		onpick={(room) => install(picking!, room)}
		onclose={() => (picking = null)}
	/>
{/if}

<script lang="ts">
	import { useMutation, useQuery } from 'convex-svelte';
	import { onMount } from 'svelte';
	import Button from '$lib/landing/Button.svelte';
	import Price from '$lib/landing/Price.svelte';
	import { api } from '../../convex/_generated/api';
	import type { RoomView } from '../../convex/office';
	import { formatRemaining, ordersUi } from './orders.svelte';
	import { flyReward } from '$lib/fx/fly';

	let { room }: { room: RoomView } = $props();

	const orders = useQuery(api.orders.active, {});
	const collect = useMutation(api.orders.collect);
	const me = useQuery(api.players.me, {});
	const noEnergy = $derived((me.data?.energy ?? 1) < 1);
	const energyIn = $derived(Math.max(1, Math.ceil((me.data?.energyNextInMs ?? 0) / 60000)));

	let now = $state(Date.now());
	let error = $state('');
	let busy = $state(false);

	onMount(() => {
		const id = setInterval(() => (now = Date.now()), 1000);
		return () => clearInterval(id);
	});

	const order = $derived(orders.data?.find((o) => o.roomId === room._id) ?? null);
	const remaining = $derived(order ? Math.max(0, (order.endsAt ?? 0) - now) : 0);
	const ready = $derived(order !== null && remaining === 0);

	async function take() {
		if (!order) return;
		error = '';
		busy = true;
		try {
			const reward = order.reward;
			const from = ordersUi.projectRoom?.(room._id) ?? { x: innerWidth / 2, y: innerHeight / 2 };
			await collect({ orderId: order._id });
			flyReward(from, reward);
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			busy = false;
		}
	}
</script>

<div class="app-panel__box">
	{#if !room.worker}
		<p class="app-muted">Заказы берёт сотрудник. Стол пока пуст.</p>
	{:else if !order}
		<p class="app-muted">Заказа нет. Выберите заказ во входящих и нажмите на эту комнату.</p>
	{:else}
		<p class="app-panel__slot-name">{order.title}</p>
		<p class="app-muted">
			{ready ? 'Готово' : `Осталось ${formatRemaining(remaining)}`} · <Price
				value={order.reward.coins}
			/>
			<Price value={order.reward.xp} kind="xp" />
		</p>
		<div class="app-panel__action">
			{#if ready}
				<Button color="black" size="medium" disabled={busy} onclick={take}
					>Забрать <Price value={order.reward.coins} /></Button
				>
			{:else}
				<Button
					color="black"
					size="medium"
					disabled={noEnergy}
					onclick={() =>
						['ucoz', 'rusender', 'webask'].includes(order.product)
							? ((ordersUi.buildKind =
									order.product === 'rusender'
										? 'flow'
										: order.product === 'webask'
											? 'memory'
											: 'build'),
								(ordersUi.helpOrderId = order!._id))
							: (ordersUi.quizOrderId = order!._id)}>Помочь</Button
				>
				{#if noEnergy}
					<p class="app-muted">Нет энергии · +1 через {energyIn} мин</p>
				{/if}
			{/if}
		</div>
	{/if}
	{#if error}
		<p class="app-error">{error}</p>
	{/if}
</div>

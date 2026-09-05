<script lang="ts">
	import Quiz from '$lib/lessons/quiz/Quiz.svelte';
	import InventoryTray from '$lib/office/InventoryTray.svelte';
	import HelpChoice from '$lib/build/HelpChoice.svelte';
	import BuildGame from '$lib/build/BuildGame.svelte';
	import FlowGame from '$lib/build/FlowGame.svelte';
	import MemoryGame from '$lib/build/MemoryGame.svelte';
	import OrdersTray from '$lib/office/OrdersTray.svelte';
	import { ordersUi } from '$lib/office/orders.svelte';
	import RoomPanel from '$lib/office/RoomPanel.svelte';
	import Scene from '$lib/office/Scene.svelte';
	import { portrait } from '$lib/market/people';
	import { useMutation, useQuery } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api';
	import type { Doc } from '../../../convex/_generated/dataModel';

	const office = useQuery(api.office.state, {});
	const refill = useMutation(api.orders.refill);
	const assign = useMutation(api.orders.assign);
	const inventory = useQuery(api.office.inventory, {});
	const place = useMutation(api.office.place);

	let selectedRoomId = $state<string | null>(null);
	let selectedHex = $state<{ q: number; r: number } | null>(null);
	let assignError = $state('');
	let refilled = false;

	const selectedRoom = $derived(office.data?.rooms.find((r) => r._id === selectedRoomId) ?? null);

	$effect(() => {
		if (office.data && !refilled) {
			refilled = true;
			refill({});
		}
	});

	$effect(() => {
		if (inventory.data && inventory.data.length === 0) ordersUi.inventoryOpen = false;
	});

	async function placeTo(inventoryId: Doc<'inventory'>['_id'], id: string): Promise<boolean> {
		assignError = '';
		try {
			await place({ inventoryId, roomId: id as Doc<'rooms'>['_id'] });
			ordersUi.selectedOffer = null;
			selectedHex = null;
			selectedRoomId = id;
			return true;
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			assignError = message.includes('NO_FREE_SLOT')
				? 'В комнате нет свободного слота'
				: message.includes('ROOM_HAS_WORKER')
					? 'В комнате уже есть сотрудник'
					: message;
			return false;
		}
	}

	function close() {
		selectedRoomId = null;
		selectedHex = null;
	}

	async function assignTo(offerId: Doc<'offerSlots'>['_id'], id: string): Promise<boolean> {
		assignError = '';
		try {
			await assign({ slotId: offerId, roomId: id as Doc<'rooms'>['_id'] });
			ordersUi.selectedOffer = null;
			selectedHex = null;
			selectedRoomId = id;
			return true;
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			assignError = message.includes('NO_WORKER')
				? 'В комнате нет сотрудника'
				: message.includes('ORDER_IN_PROGRESS')
					? 'Комната уже занята заказом'
					: message;
			return false;
		}
	}

	async function onRoomTap(id: string) {
		const offer = ordersUi.selectedOffer;
		if (!offer) {
			selectedHex = null;
			selectedRoomId = id;
			return;
		}
		if (offer.kind === 'offer') await assignTo(offer.id as Doc<'offerSlots'>['_id'], id);
		else await placeTo(offer.id as Doc<'inventory'>['_id'], id);
	}
</script>

<main class="lp-container app-page app-page--office">
	{#if office.isLoading}
		<p class="app-hint">Загрузка офиса…</p>
	{:else if office.error}
		<p class="app-error">{office.error.message}</p>
	{:else if office.data}
		{@const view = office.data}
		<Scene
			{view}
			title={view.tier.title}
			{selectedRoomId}
			{selectedHex}
			onSelectRoom={onRoomTap}
			onSelectHex={(hex) => {
				selectedRoomId = null;
				selectedHex = hex;
			}}
			onDeselect={close}
			inventoryCount={inventory.data?.length ?? 0}
		>
			{#snippet panel()}
				<RoomPanel {view} room={selectedRoom} hex={selectedHex} onclose={close} />
			{/snippet}
			{#snippet tray()}
				{#if ordersUi.inventoryOpen}
					<InventoryTray items={inventory.data ?? []} onplace={placeTo} />
				{:else}
					<OrdersTray onassign={assignTo} />
				{/if}
			{/snippet}
		</Scene>
		{#if assignError}
			<p class="app-error">{assignError}</p>
		{/if}
	{/if}
	{#if ordersUi.quizOrderId}
		<Quiz
			orderId={ordersUi.quizOrderId}
			portrait={selectedRoom?.worker
				? portrait(selectedRoom.worker.isPlayer ? 'player' : selectedRoom.worker.name, 'confused')
				: undefined}
			onclose={() => (ordersUi.quizOrderId = null)}
		/>
	{/if}
	{#if ordersUi.helpOrderId}
		<HelpChoice
			kind={ordersUi.buildKind}
			onquiz={() => {
				ordersUi.quizOrderId = ordersUi.helpOrderId;
				ordersUi.helpOrderId = null;
			}}
			onbuild={() => {
				ordersUi.buildOrderId = ordersUi.helpOrderId;
				ordersUi.helpOrderId = null;
			}}
			onclose={() => (ordersUi.helpOrderId = null)}
		/>
	{/if}
	{#if ordersUi.buildOrderId}
		{#if ordersUi.buildKind === 'flow'}
			<FlowGame orderId={ordersUi.buildOrderId} onclose={() => (ordersUi.buildOrderId = null)} />
		{:else if ordersUi.buildKind === 'memory'}
			<MemoryGame orderId={ordersUi.buildOrderId} onclose={() => (ordersUi.buildOrderId = null)} />
		{:else}
			<BuildGame orderId={ordersUi.buildOrderId} onclose={() => (ordersUi.buildOrderId = null)} />
		{/if}
	{/if}
</main>

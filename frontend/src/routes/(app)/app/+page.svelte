<script lang="ts">
	import Quiz from '$lib/lessons/quiz/Quiz.svelte';
	import OrdersTray from '$lib/office/OrdersTray.svelte';
	import { ordersUi } from '$lib/office/orders.svelte';
	import RoomPanel from '$lib/office/RoomPanel.svelte';
	import Scene from '$lib/office/Scene.svelte';
	import { useMutation, useQuery } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api';
	import type { Doc } from '../../../convex/_generated/dataModel';

	const office = useQuery(api.office.state, {});
	const refill = useMutation(api.orders.refill);
	const assign = useMutation(api.orders.assign);

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
			assignError = message.includes('WRONG_DEPARTMENT')
				? 'Этот заказ для другого отдела'
				: message.includes('NO_WORKER')
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
		await assignTo(offer.id, id);
	}
</script>

<main class="lp-container app-page">
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
		>
			{#snippet panel()}
				<RoomPanel {view} room={selectedRoom} hex={selectedHex} onclose={close} />
			{/snippet}
			{#snippet tray()}
				<OrdersTray onassign={assignTo} />
			{/snippet}
		</Scene>
		{#if assignError}
			<p class="app-error">{assignError}</p>
		{/if}
	{/if}
	{#if ordersUi.quizOrderId}
		<Quiz orderId={ordersUi.quizOrderId} onclose={() => (ordersUi.quizOrderId = null)} />
	{/if}
</main>

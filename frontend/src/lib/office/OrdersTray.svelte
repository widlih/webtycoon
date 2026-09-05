<script lang="ts">
	import { ClipboardList, Globe, Hourglass, Lock, Send } from '@lucide/svelte';
	import { animate } from 'animejs';
	import { useMutation, useQuery } from 'convex-svelte';
	import { onMount } from 'svelte';
	import Price from '$lib/landing/Price.svelte';
	import { api } from '../../convex/_generated/api';
	import type { Id } from '../../convex/_generated/dataModel';
	import { formatRemaining, ordersUi } from './orders.svelte';

	let { onassign }: { onassign: (slotId: Id<'offerSlots'>, roomId: string) => Promise<boolean> } =
		$props();

	const data = useQuery(api.orders.slots, {});
	const refill = useMutation(api.orders.refill);
	const unlock = useMutation(api.orders.unlock);

	const productIcons = { rusender: Send, ucoz: Globe, webask: ClipboardList } as const;

	let ghost = $state<HTMLDivElement | null>(null);
	let now = $state(Date.now());
	let unlockError = $state('');
	let start: { x: number; y: number; moved: boolean } | null = null;

	onMount(() => {
		const id = setInterval(() => {
			now = Date.now();
			if (data.data?.slots.some((s) => !s.offer && s.readyAt !== null && s.readyAt <= now))
				refill({});
		}, 1000);
		return () => clearInterval(id);
	});

	type Offer = { _id: Id<'offerSlots'>; product: string; title: string };

	function begin(event: PointerEvent, offer: Offer) {
		if (event.button !== 0 && event.pointerType === 'mouse') return;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		start = { x: event.clientX, y: event.clientY, moved: false };
		ordersUi.drag = {
			id: offer._id,
			product: offer.product,
			title: offer.title,
			x: event.clientX,
			y: event.clientY
		};
	}

	function move(event: PointerEvent) {
		if (!ordersUi.drag || !start) return;
		if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) start.moved = true;
		ordersUi.drag = { ...ordersUi.drag, x: event.clientX, y: event.clientY };
		ordersUi.hoverRoomId = start.moved
			? (ordersUi.hitTest?.(event.clientX, event.clientY) ?? null)
			: null;
	}

	async function end(event: PointerEvent) {
		const drag = ordersUi.drag;
		if (!drag || !start) return;
		const moved = start.moved;
		const roomId = moved ? (ordersUi.hitTest?.(event.clientX, event.clientY) ?? null) : null;
		start = null;
		ordersUi.hoverRoomId = null;
		if (!moved) {
			ordersUi.drag = null;
			toggle(drag);
			return;
		}
		if (roomId && ghost) {
			const target = ordersUi.projectRoom?.(roomId);
			if (target) {
				await animate(ghost, {
					x: target.x - drag.x,
					y: target.y - drag.y,
					scale: 0.3,
					opacity: 0,
					duration: 420,
					ease: 'inOutQuad'
				}).then();
			}
			ordersUi.drag = null;
			ordersUi.selectedOffer = null;
			await onassign(drag.id, roomId);
			return;
		}
		ordersUi.drag = null;
	}

	function cancel() {
		start = null;
		ordersUi.drag = null;
		ordersUi.hoverRoomId = null;
	}

	function toggle(offer: { id: Id<'offerSlots'>; product: string }) {
		ordersUi.selectedOffer =
			ordersUi.selectedOffer?.id === offer.id ? null : { id: offer.id, product: offer.product };
	}

	async function buySlot() {
		unlockError = '';
		try {
			await unlock({});
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			unlockError = message.includes('INSUFFICIENT_FUNDS') ? 'Не хватает монет' : message;
			setTimeout(() => (unlockError = ''), 2500);
		}
	}
</script>

<div class="tray">
	{#if unlockError}
		<div class="tray__toast app-tag">{unlockError}</div>
	{/if}
	<div class="tray__cards">
		{#each data.data?.slots ?? [] as slot (slot._id)}
			{#if slot.offer}
				{@const ProductIcon = productIcons[slot.offer.product as keyof typeof productIcons] ?? Send}
				<div
					class="card"
					class:is-selected={ordersUi.selectedOffer?.id === slot._id}
					class:is-dragging={ordersUi.drag?.id === slot._id}
					role="button"
					tabindex="0"
					onpointerdown={(e) =>
						begin(e, { _id: slot._id, product: slot.offer!.product, title: slot.offer!.title })}
					onpointermove={move}
					onpointerup={end}
					onpointercancel={cancel}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							toggle({ id: slot._id, product: slot.offer!.product });
						}
					}}
				>
					<div class="card__head">
						<span class="card__icon"><ProductIcon size={16} strokeWidth={2.25} /></span>
						<span class="card__title">{slot.offer.title}</span>
					</div>
					<div class="card__foot">
						<span class="card__time"
							><Hourglass size={14} strokeWidth={2.25} />{slot.offer.durationMin} мин</span
						>
						<span class="card__reward">
							<Price value={slot.offer.reward.coins} />
							<Price value={slot.offer.reward.xp} kind="xp" />
						</span>
					</div>
				</div>
			{:else}
				<div class="card card--wait">
					<Hourglass size={18} strokeWidth={2.25} />
					<span class="card__timer">{formatRemaining((slot.readyAt ?? now) - now)}</span>
				</div>
			{/if}
		{/each}
		{#if data.data}
			{#each Array.from({ length: data.data.max - data.data.unlocked }, (_, k) => k) as i (i)}
				{#if i === 0 && data.data.nextPrice !== null}
					<button type="button" class="card card--lock card--next" onclick={buySlot}>
						<Lock size={18} strokeWidth={2.25} />
						<Price value={data.data.nextPrice} />
					</button>
				{:else}
					<div class="card card--lock"><Lock size={18} strokeWidth={2.25} /></div>
				{/if}
			{/each}
		{/if}
	</div>
</div>

{#if ordersUi.drag}
	<div
		bind:this={ghost}
		class="app-tag tray-ghost"
		style="left: {ordersUi.drag.x}px; top: {ordersUi.drag.y}px"
	>
		{ordersUi.drag.title}
	</div>
{/if}

<style>
	.tray {
		position: absolute;
		left: 16px;
		right: 16px;
		bottom: 16px;
		display: grid;
		gap: 8px;
		pointer-events: none;
	}
	.tray__toast {
		justify-self: center;
		color: #c0392b;
	}
	.tray__cards {
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		gap: 8px;
		pointer-events: auto;
	}
	.card {
		box-sizing: border-box;
		height: 92px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 6px;
		padding: 12px;
		border: 0;
		border-radius: 20px;
		background: #fff;
		color: var(--ink, #111);
		font: 400 13px/130% var(--text-font, system-ui);
		letter-spacing: -0.26px;
		text-align: left;
		box-shadow:
			0 2px 5px #0000000a,
			0 10px 10px #0000000a;
		touch-action: none;
		user-select: none;
		-webkit-user-select: none;
		cursor: grab;
	}
	.card.is-selected {
		outline: 2px solid #a981ff;
		outline-offset: -2px;
	}
	.card.is-dragging {
		opacity: 0.45;
		cursor: grabbing;
	}
	.card__head {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		min-width: 0;
	}
	.card__icon {
		flex: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 26px;
		border-radius: 8px;
		background: #f1f0f4;
		color: #6b5bd6;
	}
	.card__title {
		font: 600 13px/130% var(--display, system-ui);
		letter-spacing: -0.26px;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.card__foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		min-width: 0;
	}
	.card__time {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		color: var(--muted, #8a8a90);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.card__reward {
		display: inline-flex;
		gap: 6px;
		font: 600 13px/1 var(--display, system-ui);
		white-space: nowrap;
	}
	.card--wait,
	.card--lock {
		background: transparent;
		box-shadow: none;
		border: 1.5px dashed #b8b8be;
		color: #b8b8be;
	}
	.card--next {
		border-color: var(--muted, #8a8a90);
		color: var(--ink, #111);
		cursor: pointer;
	}
	.card--next:hover {
		border-color: var(--ink, #111);
	}
	.tray-ghost {
		position: fixed;
		z-index: 60;
		transform: translate(-50%, -120%);
		pointer-events: none;
		max-width: 240px;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	@media (max-width: 640px) {
		.card {
			height: 84px;
			padding: 10px;
			border-radius: 16px;
		}
		.card__reward :global(.app-price + .app-price) {
			display: none;
		}
	}
</style>

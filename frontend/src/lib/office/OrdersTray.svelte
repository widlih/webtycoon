<script lang="ts">
	import { ClipboardList, Globe, Hourglass, Lock, RefreshCw, Send } from '@lucide/svelte';
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
	const swap = useMutation(api.orders.swap);

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
			kind: 'offer',
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
			await onassign(drag.id as Id<'offerSlots'>, roomId);
			return;
		}
		ordersUi.drag = null;
	}

	function cancel() {
		start = null;
		ordersUi.drag = null;
		ordersUi.hoverRoomId = null;
	}

	function toggle(offer: { id: string; product?: string }) {
		ordersUi.selectedOffer =
			ordersUi.selectedOffer?.id === offer.id
				? null
				: { id: offer.id, kind: 'offer', product: offer.product };
	}

	async function swapOffer(slotId: Id<'offerSlots'>) {
		unlockError = '';
		try {
			await swap({ slotId });
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			unlockError = message.includes('SWAP_USED')
				? 'Замена уже использована'
				: message.includes('NO_ALTERNATIVE')
					? 'Другого заказа пока нет'
					: message;
			setTimeout(() => (unlockError = ''), 2500);
		}
	}

	async function buySlot() {
		unlockError = '';
		try {
			await unlock({});
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			const premium = data.data?.nextPrice?.currency === 'premium';
			unlockError = message.includes('INSUFFICIENT_FUNDS')
				? premium
					? 'Не хватает премиума'
					: 'Не хватает монет'
				: message;
			setTimeout(() => (unlockError = ''), 2500);
		}
	}
</script>

<div class="tray">
	{#if unlockError}
		<div class="tray__toast app-tag">{unlockError}</div>
	{/if}
	<div class="tray__cards">
		<img
			class="tray__sign"
			src="/img/divly-sign.webp"
			alt="divly"
			draggable="false"
			data-tip="Divly: сайт студии, где клиенты оставляют заказы. Берите их в работу и получайте награду"
		/>
		{#each data.data?.slots ?? [] as slot (slot._id)}
			{#if slot.offer}
				{@const ProductIcon = productIcons[slot.offer.product as keyof typeof productIcons] ?? Send}
				<div
					class="card card--{slot.offer.product}"
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
					<div class="card__brand">
						{#if slot.offer.product in productIcons}
							<img
								class="card__logo"
								src="/img/logos/{slot.offer.product}.svg"
								alt={slot.offer.product}
								draggable="false"
							/>
						{:else}
							<span class="card__icon"><ProductIcon size={16} strokeWidth={2.25} /></span>
						{/if}
						{#if !slot.swapped}
							<button
								type="button"
								class="card__swap"
								aria-label="Заменить заказ"
								data-tip="Заменить заказ, один раз бесплатно"
								onpointerdown={(e) => e.stopPropagation()}
								onclick={() => swapOffer(slot._id)}
							>
								<RefreshCw size={14} strokeWidth={2.25} />
							</button>
						{/if}
					</div>
					<span class="card__title">{slot.offer.title}</span>
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
				<div class="card card--wait" data-tip="Новый заказ появится, когда закончится таймер">
					<Hourglass size={18} strokeWidth={2.25} />
					<span class="card__timer">{formatRemaining((slot.readyAt ?? now) - now)}</span>
				</div>
			{/if}
		{/each}
		{#if data.data}
			{#each Array.from({ length: data.data.max - data.data.unlocked }, (_, k) => k) as i (i)}
				{#if i === 0 && data.data.nextPrice !== null}
					{@const price = data.data.nextPrice}
					<button
						type="button"
						class="card card--lock card--next"
						data-tip={price.currency === 'premium'
							? 'Открыть последний слот заказов за премиум'
							: 'Открыть ещё один слот заказов'}
						onclick={buySlot}
					>
						<Lock size={18} strokeWidth={2.25} />
						<span class="card__price"><Price value={price.amount} kind={price.currency} /></span>
					</button>
				{:else}
					<div class="card card--lock" data-tip="Откроется после покупки предыдущего слота">
						<Lock size={18} strokeWidth={2.25} />
					</div>
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
		grid-template-columns: 150px repeat(5, minmax(0, 1fr));
		gap: 8px;
		align-items: end;
		max-width: 1240px;
		margin: 0 auto;
		pointer-events: auto;
	}
	.tray__sign {
		display: block;
		width: 150px;
		height: 120px;
		object-fit: contain;
		object-position: center bottom;
		pointer-events: auto;
		user-select: none;
	}
	.card {
		box-sizing: border-box;
		min-height: 84px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 4px;
		padding: 10px;
		border: 0;
		border-radius: 16px;
		background: #fff;
		color: var(--ink, #111);
		font: 400 12px/130% var(--text-font, system-ui);
		letter-spacing: -0.24px;
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
	.card--rusender {
		--brand: #a981ff;
		--brand-soft: #efe8ff;
	}
	.card--ucoz {
		--brand: #50b8ff;
		--brand-soft: #e2f2ff;
	}
	.card--webask {
		--brand: #ff9a3d;
		--brand-soft: #ffeedd;
	}
	.card__brand {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		margin: -10px -10px 2px;
		padding: 7px 10px 6px;
		border-radius: 16px 16px 0 0;
		background: var(--brand-soft, #f1f0f4);
		box-shadow: inset 0 -2px 0 var(--brand, transparent);
	}
	.card__logo {
		display: block;
		height: 15px;
		width: auto;
		max-width: 100px;
		pointer-events: none;
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
	.card__swap {
		flex: none;
		margin-left: auto;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		padding: 0;
		border: 0;
		border-radius: 8px;
		background: transparent;
		color: var(--muted, #8a8a90);
		cursor: pointer;
	}
	.card__swap:hover {
		background: #f1f0f4;
		color: var(--ink, #111);
	}
	.card__title {
		font: 600 12px/130% var(--display, system-ui);
		letter-spacing: -0.24px;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.card__foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 4px 8px;
		flex-wrap: wrap;
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
		min-width: 0;
		overflow: hidden;
		align-items: center;
		justify-content: center;
		gap: 6px;
		background: transparent;
		box-shadow: none;
		border: 1.5px dashed #b8b8be;
		color: #b8b8be;
	}
	.card--next {
		border-color: var(--muted, #8a8a90);
		color: var(--ink, #111);
		cursor: pointer;
		transition: border-color 0.2s var(--quad, ease-out);
	}
	.card__price {
		display: inline-flex;
		justify-content: center;
	}
	.card__price :global(.app-price) {
		gap: 6px;
		font: 700 18px/1 var(--display, system-ui);
		letter-spacing: -0.36px;
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
	@media (max-width: 1440px) {
		.tray__cards {
			grid-template-columns: repeat(5, minmax(0, 1fr));
		}
		.tray__sign {
			display: none;
		}
		.card__reward :global(.app-price + .app-price) {
			display: none;
		}
	}
	@media (max-width: 1024px) {
		.tray__cards {
			grid-template-columns: none;
			grid-auto-flow: column;
			grid-auto-columns: 160px;
			overflow-x: auto;
			padding-bottom: 2px;
			scrollbar-width: none;
		}
		.tray__cards::-webkit-scrollbar {
			display: none;
		}
		.tray__sign {
			display: none;
		}
		.card {
			min-height: 72px;
			padding: 8px;
			border-radius: 14px;
		}
		.card__reward :global(.app-price + .app-price) {
			display: none;
		}
	}
</style>

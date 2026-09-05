<script lang="ts">
	import { animate } from 'animejs';
	import { portrait } from '$lib/market/people';
	import type { Id } from '../../convex/_generated/dataModel';
	import type { InventoryEntry } from '../../convex/office';
	import { ordersUi } from './orders.svelte';

	let {
		items,
		onplace
	}: {
		items: InventoryEntry[];
		onplace: (inventoryId: Id<'inventory'>, roomId: string) => Promise<boolean>;
	} = $props();

	let ghost = $state<HTMLDivElement | null>(null);
	let start: { x: number; y: number; moved: boolean } | null = null;

	const picture = (entry: InventoryEntry) =>
		entry.kind === 'worker' ? portrait(entry.slug) : `/img/items/${entry.slug}.webp`;

	function begin(event: PointerEvent, entry: InventoryEntry) {
		if (event.button !== 0 && event.pointerType === 'mouse') return;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		start = { x: event.clientX, y: event.clientY, moved: false };
		ordersUi.drag = {
			id: entry._id,
			kind: entry.kind,
			title: entry.title,
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
			toggle(drag.id as Id<'inventory'>, drag.kind as InventoryEntry['kind']);
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
			await onplace(drag.id as Id<'inventory'>, roomId);
			return;
		}
		ordersUi.drag = null;
	}

	function cancel() {
		start = null;
		ordersUi.drag = null;
		ordersUi.hoverRoomId = null;
	}

	function toggle(id: Id<'inventory'>, kind: InventoryEntry['kind']) {
		ordersUi.selectedOffer = ordersUi.selectedOffer?.id === id ? null : { id, kind };
	}
</script>

<div class="tray">
	{#if items.length === 0}
		<div class="tray__empty app-tag">
			Инвентарь пуст. Предметы и сотрудники покупаются в маркете.
		</div>
	{:else}
		<div class="tray__cards">
			{#each items as entry (entry._id)}
				{@const src = picture(entry)}
				<div
					class="card"
					class:is-selected={ordersUi.selectedOffer?.id === entry._id}
					class:is-dragging={ordersUi.drag?.id === entry._id}
					role="button"
					tabindex="0"
					onpointerdown={(e) => begin(e, entry)}
					onpointermove={move}
					onpointerup={end}
					onpointercancel={cancel}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							toggle(entry._id, entry.kind);
						}
					}}
				>
					{#if src}
						<img class="card__pic" {src} alt="" draggable="false" />
					{:else}
						<span class="card__pic card__pic--letter">{entry.title.charAt(0)}</span>
					{/if}
					<span class="card__title">{entry.title}</span>
					<span class="card__text">{entry.text}</span>
				</div>
			{/each}
		</div>
	{/if}
</div>

{#if ordersUi.drag && ordersUi.drag.kind !== 'offer'}
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
		pointer-events: none;
	}
	.tray__empty {
		justify-self: center;
		pointer-events: auto;
	}
	.tray__cards {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(120px, 1fr);
		gap: 8px;
		overflow-x: auto;
		padding-bottom: 2px;
		pointer-events: auto;
		scrollbar-width: none;
	}
	.card {
		box-sizing: border-box;
		height: 92px;
		display: grid;
		grid-template-columns: 44px 1fr;
		grid-template-rows: auto auto;
		column-gap: 10px;
		align-content: center;
		padding: 12px;
		border-radius: 20px;
		background: #fff;
		color: var(--ink, #111);
		font: 400 12px/130% var(--text-font, system-ui);
		letter-spacing: -0.24px;
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
	.card__pic {
		grid-row: 1 / 3;
		width: 44px;
		height: 44px;
		object-fit: contain;
		border-radius: 12px;
		background: #f1f0f4;
		pointer-events: none;
	}
	.card__pic--letter {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font: 600 18px/1 var(--display, system-ui);
		color: #6b5bd6;
	}
	.card__title {
		font: 600 13px/130% var(--display, system-ui);
		letter-spacing: -0.26px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.card__text {
		color: var(--muted, #8a8a90);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
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
		.tray {
			left: 8px;
			right: 8px;
			bottom: 8px;
		}
		.card {
			height: 84px;
			padding: 10px;
			border-radius: 16px;
		}
	}
</style>

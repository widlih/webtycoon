<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Canvas } from '@threlte/core';
	import { MousePointerClick } from '@lucide/svelte';
	import { NeutralToneMapping } from 'three';
	import { Music, Package, VolumeX } from '@lucide/svelte';
	import { ordersUi } from './orders.svelte';
	import { isMusicOn, toggleMusic } from '$lib/fx/music.svelte';
	import type { OfficeView } from '../../convex/office';
	import Hub from './Hub.svelte';
	import PayrollNote from './PayrollNote.svelte';

	let {
		view,
		title = '',
		selectedRoomId = null,
		selectedHex = null,
		onSelectRoom,
		onSelectHex,
		onDeselect,
		panel,
		tray,
		inventoryCount = 0
	}: {
		view: OfficeView;
		title?: string;
		selectedRoomId?: string | null;
		selectedHex?: { q: number; r: number } | null;
		onSelectRoom: (id: string) => void;
		onSelectHex: (hex: { q: number; r: number }) => void;
		onDeselect: () => void;
		panel?: Snippet;
		tray?: Snippet;
		inventoryCount?: number;
	} = $props();

	let width = $state(0);
	// Реальная высота шторки: она перестала быть фиксированной долей сцены,
	// поэтому сдвиг камеры считаем от того, что действительно закрыто.
	let sheetHeight = $state(0);

	const open = $derived(Boolean(selectedRoomId || selectedHex));
	const desktop = $derived(width >= 1025);
	const shiftX = $derived(open && desktop ? (380 + 32) / 2 : 0);
	const shiftY = $derived(open && !desktop ? (sheetHeight + 16) / 2 : 0);
</script>

<div
	class="app-scene"
	class:is-open={open}
	style="--scene-bg: url(/img/offices/tier-{view.tier.tier}.webp)"
	bind:clientWidth={width}
>
	<Canvas shadows dpr={[1, 2]} toneMapping={NeutralToneMapping}>
		<Hub
			{view}
			{selectedRoomId}
			{selectedHex}
			{shiftX}
			{shiftY}
			{onSelectRoom}
			{onSelectHex}
			{onDeselect}
		/>
	</Canvas>
	{#if title}<p class="app-scene__title">{title}</p>{/if}
	<div
		class="app-scene__office"
		data-tip="Уровень офиса задаёт число комнат и слотов под полезные предметы. Офис побольше продаётся в маркете"
	></div>
	<PayrollNote />
	<button
		class="app-iconbtn app-scene__music"
		aria-label={isMusicOn() ? 'Выключить музыку' : 'Включить музыку'}
		data-tip={isMusicOn() ? 'Выключить музыку' : 'Включить музыку'}
		aria-pressed={isMusicOn()}
		onclick={toggleMusic}
	>
		{#if isMusicOn()}<Music size={18} strokeWidth={2.25} />{:else}<VolumeX
				size={18}
				strokeWidth={2.25}
			/>{/if}
	</button>
	<button
		class="app-iconbtn app-scene__inventory"
		class:is-active={ordersUi.inventoryOpen}
		aria-label="Инвентарь"
		data-tip="Инвентарь: купленные предметы и сотрудники"
		aria-pressed={ordersUi.inventoryOpen}
		onclick={() => (ordersUi.inventoryOpen = !ordersUi.inventoryOpen)}
	>
		<Package size={18} strokeWidth={2.25} />
		{#if inventoryCount > 0}<span class="app-scene__badge">{inventoryCount}</span>{/if}
	</button>
	<p class="app-scene__hint" data-tip="Нажмите на комнату или на свободный гекс">
		<MousePointerClick size={20} strokeWidth={2} />
	</p>
	{#if !open}
		{@render tray?.()}
	{/if}
	<div class="app-sheet" bind:clientHeight={sheetHeight}>
		{#if open}
			{@render panel?.()}
		{/if}
	</div>
</div>

<style>
	.app-scene__office {
		position: absolute;
		left: 4%;
		top: 12%;
		height: 32%;
		aspect-ratio: 1 / 1;
		z-index: 10;
	}
	/* Зона подсказки повторяет картинку офиса: на телефоне она задана в пикселях */
	@media screen and (max-width: 1024px) {
		.app-scene__office {
			left: 16px;
			top: 46px;
			height: 52px;
		}
	}
	.app-scene__inventory {
		position: absolute;
		top: 64px;
		right: 16px;
		z-index: 20;
		background: #fff;
	}
	.app-scene__inventory.is-active {
		background: var(--ink, #19171c);
		color: #fff;
	}
	.app-scene.is-open .app-scene__inventory {
		opacity: 0;
		pointer-events: none;
	}
	.app-scene__badge {
		position: absolute;
		top: -4px;
		right: -4px;
		min-width: 18px;
		height: 18px;
		padding: 0 5px;
		border-radius: 9px;
		background: #a981ff;
		color: #fff;
		font: 600 11px/18px var(--display, system-ui);
	}
</style>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Canvas } from '@threlte/core';
	import { MousePointerClick } from '@lucide/svelte';
	import { ACESFilmicToneMapping } from 'three';
	import { Music, VolumeX } from '@lucide/svelte';
	import { isMusicOn, toggleMusic } from '$lib/fx/music.svelte';
	import type { OfficeView } from '../../convex/office';
	import Hub from './Hub.svelte';

	let {
		view,
		title = '',
		selectedRoomId = null,
		selectedHex = null,
		onSelectRoom,
		onSelectHex,
		onDeselect,
		panel,
		tray
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
	} = $props();

	let width = $state(0);
	let height = $state(0);

	const open = $derived(Boolean(selectedRoomId || selectedHex));
	const desktop = $derived(width >= 1025);
	const shiftX = $derived(open && desktop ? (380 + 32) / 2 : 0);
	const shiftY = $derived(open && !desktop ? (height * 0.6 + 16) / 2 : 0);
</script>

<div class="app-scene" class:is-open={open} bind:clientWidth={width} bind:clientHeight={height}>
	<Canvas shadows dpr={[1, 2]} toneMapping={ACESFilmicToneMapping}>
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
	<button
		class="app-iconbtn app-scene__music"
		aria-label={isMusicOn() ? 'Выключить музыку' : 'Включить музыку'}
		aria-pressed={isMusicOn()}
		onclick={toggleMusic}
	>
		{#if isMusicOn()}<Music size={18} strokeWidth={2.25} />{:else}<VolumeX
				size={18}
				strokeWidth={2.25}
			/>{/if}
	</button>
	<p class="app-scene__hint" title="Нажмите на комнату или на свободный гекс">
		<MousePointerClick size={20} strokeWidth={2} />
	</p>
	{#if !open}
		{@render tray?.()}
	{/if}
	<div class="app-sheet">
		{#if open}
			{@render panel?.()}
		{/if}
	</div>
</div>

<script lang="ts">
	import { X } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { useMutation } from 'convex-svelte';
	import Button from '$lib/landing/Button.svelte';
	import Price from '$lib/landing/Price.svelte';
	import { api } from '../../convex/_generated/api';
	import { PRODUCT_TITLES, type Product } from '../../convex/model/constants';
	import type { OfficeView, RoomView } from '../../convex/office';
	import OrderBlock from './OrderBlock.svelte';

	let {
		view,
		room = null,
		hex = null,
		onclose
	}: {
		view: OfficeView;
		room?: RoomView | null;
		hex?: { q: number; r: number } | null;
		onclose: () => void;
	} = $props();

	const open = useMutation(api.office.open);

	let product = $state<Product>('rusender');
	let error = $state('');
	let busy = $state(false);

	const hexPrice = $derived(
		hex ? (view.available.find((h) => h.q === hex.q && h.r === hex.r)?.price ?? 0) : 0
	);

	async function openHere() {
		if (!hex) return;
		error = '';
		busy = true;
		try {
			await open({ q: hex.q, r: hex.r, product });
			onclose();
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			busy = false;
		}
	}
</script>

<section class="app-panel">
	{#if hex}
		<div class="app-panel__head">
			<div>
				<h2 class="app-panel__title">Новая комната</h2>
				<p class="app-panel__sub">Гекс {hex.q}, {hex.r}</p>
			</div>
			<button class="app-panel__close" aria-label="Закрыть" onclick={onclose}
				><X size={20} strokeWidth={2.25} /></button
			>
		</div>
		<div class="app-panel__row">
			{#each view.products as p (p.slug)}
				<button
					class="app-chip"
					class:is-active={product === p.slug}
					disabled={!p.unlocked}
					onclick={() => (product = p.slug)}
				>
					{p.title}{p.unlocked ? '' : ' · скоро'}
				</button>
			{/each}
		</div>
		<div class="app-panel__action">
			<Button color="black" size="medium" disabled={busy} onclick={openHere}>
				Открыть комнату за <Price value={hexPrice} />
			</Button>
		</div>
	{:else if room}
		<div class="app-panel__head">
			<div>
				<h2 class="app-panel__title">
					Отдел «{PRODUCT_TITLES[room.product as Product] ?? room.product}»
				</h2>
				<p class="app-panel__sub">Уровень отдела {view.skills[room.product] ?? 0}</p>
			</div>
			<button class="app-panel__close" aria-label="Закрыть" onclick={onclose}
				><X size={20} strokeWidth={2.25} /></button
			>
		</div>
		<div class="app-panel__box">
			{#if room.worker}
				<p class="app-panel__slot-name">
					{room.worker.name}{room.worker.isPlayer ? ' (это вы)' : ''}
				</p>
			{:else}
				<p class="app-muted">
					Стол свободен. <a class="app-link" href={resolve('/app/market')}
						>Нанять сотрудника в маркете</a
					>
				</p>
			{/if}
		</div>
		<OrderBlock {room} />
		<ul class="app-panel__list app-panel__list--grid">
			{#each view.slots as slot, i (slot.id)}
				{@const installed = room.items.find((s) => s.slotId === slot.id)}
				<li class="app-panel__slot app-panel__slot--stack">
					<p class="app-panel__slot-kind">Слот {i + 1}</p>
					<p class="app-panel__slot-name">
						{installed ? view.catalog.find((c) => c.slug === installed.itemSlug)?.name : 'Пусто'}
					</p>
				</li>
			{/each}
		</ul>
	{/if}
	{#if error}
		<p class="lp-auth__error">{error}</p>
	{/if}
</section>

<script lang="ts">
	import { X } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { useMutation } from 'convex-svelte';
	import Button from '$lib/landing/Button.svelte';
	import Price from '$lib/landing/Price.svelte';
	import { api } from '../../convex/_generated/api';
	import type { OfficeView, RoomView } from '../../convex/office';
	import OrderBlock from './OrderBlock.svelte';
	import { describeEffect, picture } from '$lib/market/items';
	import { portrait } from '$lib/market/people';

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
			await open({ q: hex.q, r: hex.r });
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
				<p class="app-panel__sub">Ещё один стол для сотрудника и заказов</p>
			</div>
			<button class="app-panel__close" aria-label="Закрыть" onclick={onclose}
				><X size={20} strokeWidth={2.25} /></button
			>
		</div>
		<div class="app-panel__action">
			<Button color="black" size="medium" disabled={busy} onclick={openHere}>
				Купить <Price value={hexPrice} />
			</Button>
		</div>
	{:else if room}
		<div class="app-panel__head">
			<div>
				<h2 class="app-panel__title">Комната</h2>
			</div>
			<button class="app-panel__close" aria-label="Закрыть" onclick={onclose}
				><X size={20} strokeWidth={2.25} /></button
			>
		</div>
		<div class="app-panel__box">
			{#if room.worker}
				{@const face = portrait(room.worker.isPlayer ? 'player' : room.worker.name, 'sit')}
				<div class="worker" class:has-face={Boolean(face)}>
					{#if face}<img class="worker__face" src={face} alt="" />{/if}
					<div>
						<p class="app-panel__slot-name">{room.worker.isPlayer ? 'Вы' : room.worker.name}</p>
						{#if !room.worker.isPlayer}
							<p class="app-muted">Зарплата <Price value={room.worker.salary ?? 0} /> в день</p>
						{/if}
					</div>
				</div>
			{:else}
				<p class="app-muted">
					Стол свободен. <a class="app-link" href={resolve('/app/market')}
						>Нанять сотрудника в маркете</a
					>
				</p>
			{/if}
		</div>
		<OrderBlock {room} />
		<ul class="app-items">
			{#each view.slots as slot (slot.id)}
				{@const installed = room.items.find((s) => s.slotId === slot.id)}
				{@const item = installed ? view.catalog.find((c) => c.slug === installed.itemSlug) : null}
				{#if item}
					<li class="app-item">
						<span class="app-item__pic">
							{#if picture(item.slug)}<img src={picture(item.slug)} alt="" />{/if}
						</span>
						<span class="app-item__body">
							<span class="app-item__name">{item.name}</span>
							<span class="app-item__effect">{describeEffect(item.effect)}</span>
						</span>
					</li>
				{:else}
					<li class="app-item app-item--empty">
						<span class="app-item__pic"></span>
						<span class="app-item__body">
							<span class="app-item__name">Свободный слот</span>
							<a class="app-link" href={resolve('/app/market')}>Выбрать в маркете</a>
						</span>
					</li>
				{/if}
			{/each}
		</ul>
	{/if}
	{#if error}
		<p class="lp-auth__error">{error}</p>
	{/if}
</section>

<style>
	.worker {
		display: flex;
		align-items: center;
		gap: 14px;
	}
	.worker__face {
		flex: none;
		width: 84px;
		height: 84px;
		object-fit: contain;
		object-position: center bottom;
	}
	.worker p {
		margin: 0;
	}
</style>

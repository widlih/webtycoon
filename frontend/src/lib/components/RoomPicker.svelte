<script lang="ts">
	import { X } from '@lucide/svelte';
	import type { RoomView } from '../../convex/office';
	import { PRODUCT_TITLES, type Product } from '../../convex/model/constants';

	let {
		rooms,
		title,
		onpick,
		onclose
	}: {
		rooms: RoomView[];
		title: string;
		onpick: (room: RoomView) => void;
		onclose: () => void;
	} = $props();
</script>

<div class="app-modal" role="dialog" aria-modal="true">
	<div class="app-modal__box">
		<div class="app-panel__head">
			<h2 class="app-panel__title">{title}</h2>
			<button class="app-panel__close" aria-label="Закрыть" onclick={onclose}
				><X size={20} strokeWidth={2.25} /></button
			>
		</div>
		{#if rooms.length === 0}
			<p class="app-panel__sub">Подходящих комнат нет.</p>
		{:else}
			<ul class="app-list">
				{#each rooms as room (room._id)}
					<li>
						<button class="app-row app-modal__option" onclick={() => onpick(room)}>
							<span class="app-row__title"
								>{PRODUCT_TITLES[room.product as Product] ?? room.product}</span
							>
							<span class="app-row__meta">
								гекс {room.q}, {room.r}{room.worker
									? ` · ${room.worker.name}`
									: ' · без сотрудника'}
							</span>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

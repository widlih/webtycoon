<script lang="ts">
	import BoostsTab from '$lib/market/BoostsTab.svelte';
	import BoxTab from '$lib/market/BoxTab.svelte';
	import CouponsTab from '$lib/market/CouponsTab.svelte';
	import OfficesTab from '$lib/market/OfficesTab.svelte';
	import RoomsTab from '$lib/market/RoomsTab.svelte';
	import WorkersTab from '$lib/market/WorkersTab.svelte';

	const tabs = [
		{ value: 'offices', label: 'Офисы' },
		{ value: 'rooms', label: 'Интерьер' },
		{ value: 'boosts', label: 'Ускорители' },
		{ value: 'workers', label: 'Сотрудники' },
		{ value: 'box', label: 'Бокс' },
		{ value: 'coupons', label: 'Купоны' }
	] as const;
	type Tab = (typeof tabs)[number]['value'];

	let tab = $state<Tab>('offices');
</script>

<main class="lp-container app-page">
	<div class="app-toolbar">
		<div class="app-toolbar__group">
			{#each tabs as t (t.value)}
				<button
					class="app-chip app-chip--gray"
					class:is-active={tab === t.value}
					onclick={() => (tab = t.value)}
				>
					{t.label}
				</button>
			{/each}
		</div>
	</div>

	{#if tab === 'offices'}
		<OfficesTab />
	{:else if tab === 'rooms'}
		<RoomsTab />
	{:else if tab === 'boosts'}
		<BoostsTab />
	{:else if tab === 'box'}
		<BoxTab />
	{:else if tab === 'workers'}
		<WorkersTab />
	{:else if tab === 'coupons'}
		<CouponsTab />
	{/if}
</main>

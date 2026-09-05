<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import Price from '$lib/landing/Price.svelte';
	import { api } from '../../../../convex/_generated/api';

	type Period = 'day' | 'week' | 'month';
	const periods: Array<{ value: Period; label: string }> = [
		{ value: 'day', label: 'День' },
		{ value: 'week', label: 'Неделя' },
		{ value: 'month', label: 'Месяц' }
	];

	let period = $state<Period>('day');

	const board = useQuery(api.leaderboard.board, () => ({ period }));

	const inTop = $derived(
		Boolean(board.data?.rows.some((r) => r.playerId === board.data?.playerId))
	);
</script>

<main class="lp-container app-page">
	<div class="app-toolbar">
		<div class="app-toolbar__group">
			{#each periods as item (item.value)}
				<button
					class="app-chip app-chip--gray"
					class:is-active={period === item.value}
					onclick={() => (period = item.value)}
				>
					{item.label}
				</button>
			{/each}
		</div>
	</div>

	{#if board.isLoading}
		<p class="app-hint">Загрузка…</p>
	{:else if board.error}
		<p class="app-error">{board.error.message}</p>
	{:else if board.data}
		<div class="app-list__head"><span>Ник</span><span>Очки</span></div>
		<ul class="app-list">
			{#each board.data.rows as row (row.playerId)}
				<li class="app-row" class:app-row--me={row.playerId === board.data.playerId}>
					<span><span class="app-row__rank">{row.rank}.</span>{row.nick}</span>
					<span class="app-row__score">{row.score}</span>
				</li>
			{/each}
			{#if board.data.me && !inTop}
				<li class="app-row app-row--me">
					<span><span class="app-row__rank">{board.data.me.rank}.</span>Вы</span>
					<span class="app-row__score">{board.data.me.score}</span>
				</li>
			{/if}
			{#if board.data.rows.length === 0}
				<li class="app-row app-row--empty">Пока никто не заработал очков</li>
			{/if}
		</ul>
	{/if}
</main>

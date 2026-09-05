<script lang="ts">
	import { onMount } from 'svelte';
	import { Timer, Trophy } from '@lucide/svelte';
	import { useQuery } from 'convex-svelte';
	import Price from '$lib/landing/Price.svelte';
	import { api } from '../../../../convex/_generated/api';

	type Period = 'day' | 'week' | 'month';
	const periods: Array<{ value: Period; label: string; title: string }> = [
		{ value: 'day', label: 'День', title: 'Рейтинг дня' },
		{ value: 'week', label: 'Неделя', title: 'Рейтинг недели' },
		{ value: 'month', label: 'Месяц', title: 'Рейтинг месяца' }
	];

	let period = $state<Period>('day');
	let now = $state(Date.now());
	const board = useQuery(api.leaderboard.board, () => ({ period }));

	onMount(() => {
		const id = setInterval(() => (now = Date.now()), 30000);
		return () => clearInterval(id);
	});

	const inTop = $derived(Boolean(board.data?.rows.some((r) => r.playerId === board.data?.playerId)));
	const current = $derived(periods.find((p) => p.value === period)!);

	function countdown(at: number | undefined): string {
		if (!at) return '';
		const left = Math.max(0, at - now);
		const days = Math.floor(left / 86400000);
		const hours = Math.floor((left % 86400000) / 3600000);
		const minutes = Math.floor((left % 3600000) / 60000);
		if (days > 0) return `${days} д ${hours} ч`;
		if (hours > 0) return `${hours} ч ${minutes} мин`;
		return `${minutes} мин`;
	}
</script>

<main class="lp-container app-page lb">
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
		<section class="lb-head">
			<div class="lb-head__row">
				<h1 class="lb-head__title">{current.title}</h1>
				<span class="fl-timer"><Timer size={14} strokeWidth={2.25} />Итоги через {countdown(board.data.resetsAt)}</span>
			</div>
			<p class="lb-head__note">Очки — опыт, заработанный за период. По итогам первые три места получают монеты, премиум и боксы, таблица обнуляется.</p>
			{#if board.data.prizes.length > 0}
				<div class="lb-prizes">
					{#each board.data.prizes as prize (prize.rank)}
						<div class="lb-prize lb-prize--{prize.rank}">
							<span class="lb-prize__rank"><Trophy size={14} strokeWidth={2.5} />{prize.rank} место</span>
							<span class="lb-prize__value">
								<Price value={prize.coins} />
								{#if prize.premium}<Price value={prize.premium} kind="premium" />{/if}
								{#if prize.boxes}<Price value={prize.boxes} kind="box" />{/if}
							</span>
						</div>
					{/each}
				</div>
			{:else}
				<p class="lb-head__note lb-head__note--muted">Призы за этот период пока не разыгрываются.</p>
			{/if}
		</section>

		<div class="app-list__head"><span>Ник</span><span>Очки</span></div>
		<ul class="app-list">
			{#each board.data.rows as row (row.playerId)}
				{@const prize = board.data.prizes.find((p) => p.rank === row.rank)}
				<li class="app-row lb-row" class:app-row--me={row.playerId === board.data.playerId}>
					<span class="lb-row__left">
						<span class="lb-medal lb-medal--{row.rank <= 3 ? row.rank : 'n'}">{row.rank}</span>
						<span class="lb-row__nick">{row.nick}{row.playerId === board.data.playerId ? ' · вы' : ''}</span>
					</span>
					<span class="lb-row__right">
						{#if prize}
							<span class="lb-row__prize">
								<Price value={prize.coins} />{#if prize.premium}<Price value={prize.premium} kind="premium" />{/if}{#if prize.boxes}<Price value={prize.boxes} kind="box" />{/if}
							</span>
						{/if}
						<span class="app-row__score">{row.score}</span>
					</span>
				</li>
			{/each}
			{#if board.data.me && !inTop}
				<li class="app-row lb-row app-row--me">
					<span class="lb-row__left">
						<span class="lb-medal lb-medal--n">{board.data.me.rank}</span>
						<span class="lb-row__nick">Вы</span>
					</span>
					<span class="app-row__score">{board.data.me.score}</span>
				</li>
			{/if}
			{#if board.data.rows.length === 0}
				<li class="app-row app-row--empty">Пока никто не заработал очков</li>
			{/if}
		</ul>
	{/if}
</main>

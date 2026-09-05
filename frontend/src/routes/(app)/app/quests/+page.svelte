<script lang="ts">
	import { onMount } from 'svelte';
	import MarketCard from '$lib/market/MarketCard.svelte';
	import Button from '$lib/landing/Button.svelte';
	import Price from '$lib/landing/Price.svelte';
	import { useMutation, useQuery } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api';

	const quests = useQuery(api.quests.list, {});
	const claim = useMutation(api.quests.claim);

	let error = $state('');
	let busy = $state('');
	let now = $state(Date.now());

	onMount(() => {
		const id = setInterval(() => (now = Date.now()), 30000);
		return () => clearInterval(id);
	});

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

	async function collect(slug: string) {
		error = '';
		busy = slug;
		try {
			await claim({ slug });
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			busy = '';
		}
	}

	const groups = $derived([
		{
			key: 'daily',
			title: 'Ежедневные',
			hint: `Обновятся через ${countdown(quests.data?.resets.daily)}`,
			empty: 'Все ежедневные задания выполнены',
			items: quests.data?.quests.filter((q) => q.period === 'daily') ?? []
		},
		{
			key: 'weekly',
			title: 'Еженедельные',
			hint: `Обновятся через ${countdown(quests.data?.resets.weekly)}`,
			empty: 'Все еженедельные задания выполнены',
			items: quests.data?.quests.filter((q) => q.period === 'weekly') ?? []
		},
		{
			key: 'once',
			title: 'Акции',
			hint: 'Постоянный набор, каждая выполняется один раз',
			empty: 'Все акции выполнены',
			items: quests.data?.quests.filter((q) => q.period === 'once') ?? []
		}
	]);
</script>

<main class="lp-container app-page">
	{#if quests.isLoading}
		<p class="app-hint">Загрузка…</p>
	{:else if quests.error}
		<p class="app-error mk-note">{quests.error.message}</p>
	{:else if quests.data}
		{#each groups as group (group.key)}
			<h2 class="mk-h">{group.title}</h2>
			<p class="mk-sub">{group.hint}</p>
			{#if group.items.length === 0}
				<p class="app-muted mk-note" style="margin-top:0">{group.empty}</p>
			{:else}
				<div class="mk-grid mk-grid--compact">
					{#each group.items as q (q.slug)}
						{@const ratio = Math.min(1, q.progress / q.target)}
						<MarketCard
							title={q.title}
							compact
							class="mk-card--quest"
							corner={q.kind === 'external' && !q.completed ? 'Скоро' : undefined}
						>
							{#snippet media()}<Price value={q.reward.coins} prefix="+" /> · <Price
									value={q.reward.xp}
									kind="xp"
									prefix="+"
								/>{/snippet}
							<div class="mk-progress-row">
								<div class="mk-progress" class:mk-progress--done={q.completed}>
									<div class="mk-progress__bar" style="width: {ratio * 100}%"></div>
								</div>
								<p class="mk-meta">{q.progress} из {q.target}</p>
							</div>
							{#snippet foot()}
								{#if q.completed}
									<Button
										color="black"
										size="small"
										disabled={busy === q.slug}
										onclick={() => collect(q.slug)}
									>
										Получить
									</Button>
								{/if}
							{/snippet}
						</MarketCard>
					{/each}
				</div>
			{/if}
		{/each}
		{#if error}
			<p class="app-error mk-note">{error}</p>
		{/if}
	{/if}
</main>

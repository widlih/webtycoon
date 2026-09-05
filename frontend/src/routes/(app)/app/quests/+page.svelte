<script lang="ts">
	import { onMount } from 'svelte';
	import MarketCard from '$lib/market/MarketCard.svelte';
	import Button from '$lib/landing/Button.svelte';
	import Price from '$lib/landing/Price.svelte';
	import { centerOf, flyReward } from '$lib/fx/fly';
	import ExternalQuest from '$lib/quests/ExternalQuest.svelte';
	import { useMutation, useQuery } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api';

	const quests = useQuery(api.quests.list, {});
	const claim = useMutation(api.quests.claim);
	const start = useMutation(api.quests.start);
	const finish = useMutation(api.quests.finish);

	let error = $state('');
	let busy = $state('');
	let now = $state(Date.now());
	let opened = $state<string | null>(null);
	let pending = $state<{ slug: string; until: number } | null>(null);

	const labels: Record<string, string> = {
		visit: 'Открыть',
		watch: 'Смотреть',
		newsletter: 'Подписаться',
		invite: 'Пригласить',
		telegram: 'Подписаться'
	};

	onMount(() => {
		const id = setInterval(() => (now = Date.now()), 1000);
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

	async function collect(slug: string, e?: MouseEvent) {
		error = '';
		busy = slug;
		const from = centerOf((e?.currentTarget as HTMLElement | null) ?? null);
		try {
			const reward = await claim({ slug });
			flyReward(from, reward);
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			busy = '';
		}
	}

	async function openExternal(q: { slug: string; url: string | null; seconds: number }) {
		if (!q.url) return;
		window.open(q.url, '_blank', 'noopener');
		error = '';
		try {
			await start({ slug: q.slug });
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
			return;
		}
		pending = { slug: q.slug, until: Date.now() + q.seconds * 1000 };
		setTimeout(
			async () => {
				try {
					await finish({ slug: q.slug });
				} catch (e) {
					error = e instanceof Error ? e.message : String(e);
				} finally {
					pending = null;
				}
			},
			q.seconds * 1000 + 300
		);
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
			title: 'Специальные предложения',
			hint: '',
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
			{#if group.hint}<p class="mk-sub">{group.hint}</p>{/if}
			{#if group.items.length > 0}
				<div class="mk-grid mk-grid--compact">
					{#each group.items as q (q.slug)}
						{@const ratio = Math.min(1, q.progress / q.target)}
						<MarketCard
							title={q.title}
							compact
							class="mk-card--quest"
							corner={q.action === 'telegram' && !quests.data.telegramBot ? 'Скоро' : undefined}
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
										onclick={(e) => collect(q.slug, e)}
									>
										Получить
									</Button>
								{:else if q.kind === 'external' && q.action === 'visit' && !q.frame}
									{#if pending?.slug === q.slug}
										<span class="mk-meta"
											>Награда через {Math.max(0, Math.ceil((pending.until - now) / 1000))} с</span
										>
									{:else}
										<Button color="black" size="small" onclick={() => openExternal(q)}
											>Открыть</Button
										>
									{/if}
								{:else if q.kind === 'external' && q.action}
									<Button
										color="black"
										size="small"
										disabled={q.action === 'telegram' && !quests.data.telegramBot}
										onclick={() => (opened = q.slug)}
									>
										{labels[q.action] ?? 'Открыть'}
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
		{#if opened}
			{@const q = quests.data.quests.find((x) => x.slug === opened)}
			{#if q}
				<ExternalQuest
					quest={q}
					telegramBot={quests.data.telegramBot}
					onclose={() => (opened = null)}
				/>
			{/if}
		{/if}
	{/if}
</main>

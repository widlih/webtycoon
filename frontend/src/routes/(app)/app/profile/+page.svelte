<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { LogOut } from '@lucide/svelte';
	import Button from '$lib/landing/Button.svelte';
	import Price from '$lib/landing/Price.svelte';
	import MarketCard from '$lib/market/MarketCard.svelte';
	import { authClient } from '$lib/auth';
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api';
	import { LEVEL_XP, MAX_SKILL_LEVEL } from '../../../../convex/model/constants';

	const me = useQuery(api.players.me, {});
	const office = useQuery(api.office.state, {});
	const achievements = useQuery(api.achievements.list, {});
	const board = useQuery(api.leaderboard.board, { period: 'day' });

	const initial = $derived((me.data?.nick ?? '?').trim().charAt(0).toUpperCase() || '?');
	const level = $derived(me.data?.level ?? 1);
	const xp = $derived(me.data?.xp ?? 0);
	const xpFrom = $derived(LEVEL_XP[level - 1] ?? 0);
	const xpTo = $derived(LEVEL_XP[level] ?? null);
	const xpRatio = $derived(xpTo === null ? 1 : Math.min(1, (xp - xpFrom) / (xpTo - xpFrom)));
	const since = $derived(me.data ? new Date(me.data.createdAt).toLocaleDateString('ru-RU') : '');
	const energyIn = $derived(
		me.data && me.data.energy < me.data.energyMax && me.data.energyNextInMs
			? Math.ceil(me.data.energyNextInMs / 60000)
			: null
	);
	const unlockedCount = $derived(achievements.data?.filter((a) => a.unlockedAt).length ?? 0);

	let busy = $state(false);
	async function signOut() {
		busy = true;
		await authClient.signOut();
		await goto(resolve('/'));
	}
</script>

<main class="lp-container app-page">
	{#if me.data}
		<section class="pf-hero">
			<div class="pf-hero__avatar">{initial}</div>
			<div class="pf-hero__body">
				<h1 class="pf-hero__nick">{me.data.nick}</h1>
				<p class="pf-hero__sub">
					Уровень {level}{#if board.data?.me}
						· {board.data.me.rank} место в рейтинге дня{/if} · в игре с {since}
				</p>
				<div class="mk-progress-row">
					<div class="mk-progress">
						<div class="mk-progress__bar" style="width: {xpRatio * 100}%"></div>
					</div>
					<p class="mk-meta">
						<Price value={xpTo === null ? `${xp}` : `${xp} из ${xpTo}`} kind="xp" />
					</p>
				</div>
			</div>
		</section>

		<h2 class="mk-h">Навыки</h2>
		<p class="mk-sub">Проходите уроки, чтобы улучшить навыки</p>
		<div class="mk-grid mk-grid--compact">
			{#each office.data?.products ?? [] as p (p.slug)}
				{@const skill = office.data?.skills[p.slug] ?? 0}
				<MarketCard
					title={p.title}
					compact
					class={p.unlocked ? '' : 'mk-card--locked'}
					corner={p.unlocked ? undefined : 'Скоро'}
				>
					<div class="mk-progress-row">
						<div class="mk-progress" class:mk-progress--done={skill >= MAX_SKILL_LEVEL}>
							<div class="mk-progress__bar" style="width: {(skill / MAX_SKILL_LEVEL) * 100}%"></div>
						</div>
						<p class="mk-meta">{skill} из {MAX_SKILL_LEVEL}</p>
					</div>
				</MarketCard>
			{/each}
		</div>

		<h2 class="mk-h">Ачивки</h2>
		<p class="mk-sub">Открыто {unlockedCount} из {achievements.data?.length ?? 0}</p>
		<div class="mk-grid mk-grid--compact">
			{#each achievements.data ?? [] as a (a.slug)}
				<MarketCard
					title={a.title}
					text={a.description}
					compact
					class={a.unlockedAt ? '' : 'mk-card--locked'}
				>
					{#snippet media()}<Price value={a.reward.premium} kind="premium" prefix="+" />{/snippet}
					<div class="mk-progress-row">
						<div class="mk-progress" class:mk-progress--done={Boolean(a.unlockedAt)}>
							<div
								class="mk-progress__bar"
								style="width: {Math.min(1, a.progress / a.target) * 100}%"
							></div>
						</div>
						<p class="mk-meta">{a.unlockedAt ? 'Открыто' : `${a.progress} из ${a.target}`}</p>
					</div>
				</MarketCard>
			{/each}
		</div>

		<div class="pf-actions">
			<Button color="gray" size="small" disabled={busy} onclick={signOut}>
				<LogOut size={18} strokeWidth={2.25} />Выйти
			</Button>
		</div>
	{:else if me.isLoading}
		<p class="app-hint">Загрузка…</p>
	{/if}
</main>

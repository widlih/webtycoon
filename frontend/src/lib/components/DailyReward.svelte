<script lang="ts">
	import { Check, X } from '@lucide/svelte';
	import { useMutation, useQuery } from 'convex-svelte';
	import { onMount, untrack } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import Button from '$lib/landing/Button.svelte';
	import Price from '$lib/landing/Price.svelte';
	import { burst, centerOf, flyReward } from '$lib/fx/fly';
	import { dailyUi } from '$lib/daily/state.svelte';
	import { onboarding } from '$lib/onboarding/state.svelte';
	import { api } from '../../convex/_generated/api';
	import type { DailyReward } from '../../convex/content/dailyRewards';
	import { periodKey } from '../../convex/model/constants';

	const daily = useQuery(api.daily.state, {});
	const claim = useMutation(api.daily.claim);

	let busy = $state(false);
	let error = $state('');
	let justClaimed = $state(false);
	let now = $state(Date.now());

	onMount(() => {
		const id = setInterval(() => (now = Date.now()), 30_000);
		return () => clearInterval(id);
	});

	const info = $derived(daily.data ?? null);
	const claimed = $derived(info?.claimedToday ?? false);

	function dismissKey(): string | null {
		try {
			return localStorage.getItem('wt.daily.dismissed');
		} catch {
			return null;
		}
	}

	// Автопоказ: награда ещё не забрана, подсказки онбординга закрыты и модалку сегодня не закрывали.
	$effect(() => {
		if (!info || info.claimedToday || onboarding.screen) return;
		const today = periodKey(now);
		untrack(() => {
			if (dailyUi.open || dismissKey() === today) return;
			dailyUi.open = true;
		});
	});

	$effect(() => {
		if (!dailyUi.open) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prev;
		};
	});

	function close() {
		dailyUi.open = false;
		justClaimed = false;
		if (!claimed) {
			try {
				localStorage.setItem('wt.daily.dismissed', periodKey(Date.now()));
			} catch {
				/* хранилище недоступно: просто покажем ещё раз при следующем заходе */
			}
		}
	}

	function onkeydown(e: KeyboardEvent) {
		if (dailyUi.open && e.key === 'Escape') {
			e.preventDefault();
			close();
		}
	}

	function label(r: DailyReward): string {
		if (r.boxes) return `Бокс${r.coins ? ` + ${r.coins}` : ''}`;
		if (r.energy) return `Энергия${r.coins ? ` + ${r.coins}` : ''}`;
		if (r.premium) return `${r.premium} премиум`;
		if (r.coins && r.xp) return `${r.coins} + ${r.xp} XP`;
		if (r.coins) return `${r.coins} монет`;
		return '';
	}

	function status(index: number): 'done' | 'today' | 'next' {
		if (!info) return 'next';
		const day = index + 1;
		if (day < info.day || (day === info.day && info.claimedToday)) return 'done';
		if (day === info.day) return 'today';
		return 'next';
	}

	function countdown(at: number | undefined): string {
		if (!at) return '';
		const left = Math.max(0, at - now);
		const hours = Math.floor(left / 3600000);
		const minutes = Math.floor((left % 3600000) / 60000);
		return hours > 0 ? `${hours} ч ${minutes} мин` : `${minutes} мин`;
	}

	async function take() {
		if (!info || claimed || busy) return;
		error = '';
		busy = true;
		try {
			const cell = document.querySelector<HTMLElement>('.dr__cell--today');
			const r = await claim({});
			justClaimed = true;
			if (cell) {
				burst(cell, 30);
				flyReward(centerOf(cell), { coins: r.reward.coins, xp: r.reward.xp });
			}
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			error = message.includes('DAILY_ALREADY_CLAIMED') ? 'Награда уже получена' : message;
		} finally {
			busy = false;
		}
	}
</script>

<svelte:window {onkeydown} />

{#if dailyUi.open && info}
	{@const todays = info.rewards[info.day - 1]}
	<div
		class="dr"
		role="presentation"
		transition:fade={{ duration: 160 }}
		onclick={(e) => e.target === e.currentTarget && close()}
	>
		<div
			class="dr__card"
			role="dialog"
			aria-modal="true"
			aria-label="Ежедневная награда"
			transition:fly={{ y: 24, duration: 260 }}
		>
			<button class="dr__close" aria-label="Закрыть" onclick={close}>
				<X size={20} strokeWidth={2.25} />
			</button>

			<div class="dr__art" aria-hidden="true">
				<img src="/img/daily/wheel.webp" alt="" width="600" height="400" />
			</div>
			<h2 class="dr__title">{justClaimed ? 'Награда получена' : 'Ежедневная награда'}</h2>
			<p class="dr__sub">
				{#if justClaimed}
					Серия <b>{info.streak}</b>
					{info.streak === 1 ? 'день' : 'дн.'} — следующая через {countdown(info.resetsAt)}
				{:else if claimed}
					Следующая награда через {countdown(info.resetsAt)}
				{:else}
					День <b>{info.streak}</b> подряд — награды растут, пропуск обнуляет серию
				{/if}
			</p>

			<div class="dr__grid">
				{#each info.rewards as r, i (i)}
					{@const s = status(i)}
					<div class="dr__cell dr__cell--{s}" class:dr__cell--big={Boolean(r.boxes)}>
						<span class="dr__day">
							{#if s === 'done'}<Check size={12} strokeWidth={3} />{/if}
							День {i + 1}
						</span>
						<span class="dr__value">
							{#if r.boxes}<Price value={r.boxes} kind="box" />{/if}
							{#if r.energy}<Price value="макс" kind="energy" />{/if}
							{#if r.coins}<Price value={r.coins} />{/if}
							{#if r.xp}<Price value={r.xp} kind="xp" />{/if}
							{#if r.premium}<Price value={r.premium} kind="premium" />{/if}
						</span>
					</div>
				{/each}
			</div>

			{#if error}<p class="app-error dr__error">{error}</p>{/if}

			<div class="dr__actions">
				{#if claimed}
					<Button color="black" size="medium" onclick={close}>Отлично</Button>
				{:else}
					<Button color="yellow" size="medium" disabled={busy} onclick={take}>
						{busy ? 'Получаем…' : 'Забрать награду'}
					</Button>
					<p class="dr__hint">
						Сегодня: {label(todays)}
					</p>
				{/if}
			</div>
		</div>
	</div>
{/if}

<script lang="ts">
	import { resolve } from '$app/paths';
	import { Coins, Gem, Gift, Zap } from '@lucide/svelte';
	import { useQuery } from 'convex-svelte';
	import { dailyUi } from '$lib/daily/state.svelte';
	import { api } from '../../convex/_generated/api';

	const me = useQuery(api.players.me, {});
	const daily = useQuery(api.daily.state, {});
	const dailyReady = $derived(daily.data ? !daily.data.claimedToday : false);
	const initial = $derived((me.data?.nick ?? '?').trim().charAt(0).toUpperCase() || '?');
</script>

<header class="app-header">
	<div class="lp-container">
		<div class="app-header__bar">
			<a class="app-header__logo" href={resolve('/app')}>WebTycoon</a>
			<div class="app-header__stats">
				<span
					class="app-pill"
					data-tip="Монеты: награда за заказы, уроки и задания"
					data-fly-target="coins"><Coins size={18} strokeWidth={2.25} />{me.data?.coins ?? 0}</span
				>
				<span
					class="app-pill app-pill--premium"
					data-tip="Премиум: за топ-3 рейтинга и достижения. Тратится на купоны, энергию и боксы"
					><Gem size={18} strokeWidth={2.25} />{me.data?.premium ?? 0}</span
				>
				<span class="app-pill" data-tip="Энергия: 1 за подсказку «Помочь», +1 каждые 30 минут"
					><Zap size={18} strokeWidth={2.25} />{me.data?.energy ?? 0}/{me.data?.energyMax ??
						8}</span
				>
				<button
					class="app-pill app-pill--gift"
					class:is-ready={dailyReady}
					data-tip={dailyReady ? 'Ежедневная награда ждёт' : 'Ежедневная награда'}
					aria-label="Ежедневная награда"
					onclick={() => (dailyUi.open = true)}
				>
					<Gift size={18} strokeWidth={2.25} />
					{#if dailyReady}<span class="app-pill__dot"></span>{/if}
				</button>
				<a
					class="app-pill app-pill--player"
					data-tip="Профиль"
					href={resolve('/app/profile')}
					data-fly-target="xp"
				>
					<span class="app-pill__avatar">{initial}</span>
					<span class="app-pill__nick">{me.data?.nick ?? ''}</span>
					<span class="app-pill__sub">{me.data?.level ?? 1} ур.</span>
				</a>
			</div>
		</div>
	</div>
</header>

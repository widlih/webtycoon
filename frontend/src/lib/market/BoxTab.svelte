<script lang="ts">
	import Button from '$lib/landing/Button.svelte';
	import Price from '$lib/landing/Price.svelte';
	import { burst, centerOf, flyReward } from '$lib/fx/fly';
	import { Armchair, BadgePercent, Briefcase, Coins, Gem, Rocket, Star, Zap } from '@lucide/svelte';
	import { animate, type JSAnimation } from 'animejs';
	import { useMutation, useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';
	import type { BoxPrize } from '../../convex/model/boxes';

	const me = useQuery(api.players.me, {});
	const data = useQuery(api.boxes.state, {});
	const open = useMutation(api.boxes.open);

	let boxEl = $state<HTMLElement | null>(null);
	let busy = $state(false);
	let error = $state('');
	let result = $state<{ dropId: string; prize: BoxPrize; leftToday: number; owned: number } | null>(
		null
	);

	const premium = $derived(me.data?.premium ?? 0);
	const price = $derived(data.data?.price ?? 5);
	const left = $derived(data.data?.leftToday ?? 0);
	const owned = $derived(data.data?.owned ?? 0);
	const affordable = $derived(premium >= price);
	const canBuy = $derived(Boolean(data.data) && !busy && (owned > 0 || (affordable && left > 0)));

	const icons = {
		coins: Coins,
		energy: Zap,
		xp: Star,
		bonus: Briefcase,
		freelancer: Rocket,
		item: Armchair,
		coupon: BadgePercent,
		premium: Gem
	} as const;
	const tones: Record<string, string> = {
		coins: 'yellow',
		energy: 'yellow',
		xp: 'violet',
		bonus: 'violet',
		freelancer: 'white',
		item: 'white',
		coupon: 'yellow',
		premium: 'violet'
	};
	type DropId = keyof typeof icons;
	const iconFor = (id: string) => icons[id as DropId] ?? Gem;
	const pictures: Record<string, string> = {
		coins: '/img/box/coins.webp',
		energy: '/img/box/energy.webp',
		xp: '/img/box/xp.webp',
		bonus: '/img/boosts/bonus.webp',
		freelancer: '/img/boosts/freelancer.webp',
		item: '/img/items/chair-ergo.webp',
		coupon: '/img/box/coupon.webp',
		premium: '/img/box/premium.webp'
	};

	function hint(): string | null {
		if (!data.data || owned > 0) return null;
		if (left === 0) return 'Лимит на сегодня исчерпан — возвращайтесь завтра';
		if (!affordable) return 'Не хватает премиум-валюты';
		return null;
	}

	function describe(prize: BoxPrize): { title: string; text: string } {
		switch (prize.kind) {
			case 'coins':
				return { title: `${prize.amount} монет`, text: 'Уже зачислены на баланс' };
			case 'xp':
				return { title: `${prize.amount} опыта`, text: 'Уже зачислены на баланс' };
			case 'energy':
				return { title: `+${prize.amount} энергии`, text: 'Хватит на пару квизов' };
			case 'premium':
				return { title: `${prize.amount} премиум`, text: 'Возврат премиум-валюты' };
			case 'boost':
				return prize.boost === 'freelancer'
					? {
							title: prize.title,
							text: prize.extended
								? 'Час добавлен к уже активному ускорителю'
								: 'Час все комнаты работают в два раза быстрее'
						}
					: { title: prize.title, text: 'Следующий закрытый заказ платит вдвое' };
			case 'item':
				return { title: prize.name, text: 'Лежит в инвентаре — поставьте в комнату' };
			case 'coupon':
				return { title: prize.title, text: 'Код сохранён во вкладке «Купоны»' };
		}
	}

	function friendly(message: string): string {
		if (message.includes('BOX_DAILY_LIMIT')) return 'Лимит на сегодня исчерпан';
		if (message.includes('INSUFFICIENT_FUNDS')) return 'Не хватает премиум-валюты';
		return message;
	}

	async function buy() {
		if (!canBuy) return;
		error = '';
		busy = true;
		let shake: JSAnimation | null = null;
		if (boxEl)
			shake = animate(boxEl, {
				rotate: [0, -7, 7, -5, 5, 0],
				scale: [1, 1.06, 1],
				duration: 650,
				loop: true,
				ease: 'inOutSine'
			});
		try {
			const r = await open({});
			shake?.revert();
			shake = null;
			if (boxEl) {
				burst(boxEl, 32);
				const from = centerOf(boxEl);
				if (r.prize.kind === 'coins') flyReward(from, { coins: r.prize.amount });
				if (r.prize.kind === 'xp') flyReward(from, { xp: r.prize.amount });
			}
			result = r;
		} catch (e) {
			shake?.revert();
			error = friendly(e instanceof Error ? e.message : String(e));
		} finally {
			busy = false;
		}
	}

	function again() {
		result = null;
		void buy();
	}
</script>

<section class="bx-hero">
	<h2 class="bx-hero__title">Бокс</h2>
	<p class="bx-hero__sub">
		{#if data.data && owned > 0}
			У вас боксов: <b>{owned}</b> · открываются бесплатно
		{:else if data.data}
			Доступно к покупке сегодня: <b>{left}</b>
		{:else}
			&nbsp;
		{/if}
	</p>

	<div class="bx-box" bind:this={boxEl} aria-hidden="true">
		<img src="/img/box/box.webp" alt="" draggable="false" />
	</div>

	<p class="bx-hero__note">
		Можно открыть {data.data?.dailyLimit ?? 5} боксов в день · открыто сегодня {data.data
			?.openedToday ?? 0}
	</p>
	<Button color={canBuy ? 'yellow' : 'gray'} size="medium" disabled={!canBuy} onclick={buy}>
		{#if busy}Открываем…{:else if owned > 0}Открыть бесплатно{:else}Купить&nbsp;<Price
				value={price}
				kind="premium"
			/>{/if}
	</Button>
	{#if hint()}<p class="mk-card__hint">{hint()}</p>{/if}
	{#if error}<p class="app-error">{error}</p>{/if}
</section>

<h2 class="mk-h">Что может выпасть из бокса</h2>
<div class="bx-drops">
	{#each data.data?.drops ?? [] as drop (drop.id)}
		{@const Icon = iconFor(drop.id)}
		<div class="bx-drop">
			<span class="bx-drop__icon bx-drop__icon--{tones[drop.id] ?? 'white'}">
				{#if pictures[drop.id]}
					<img src={pictures[drop.id]} alt="" draggable="false" />
				{:else}
					<Icon size={32} strokeWidth={2.25} />
				{/if}
			</span>
			<p class="bx-drop__title">{drop.title}</p>
			<p class="bx-drop__text">{drop.text}</p>
		</div>
	{/each}
</div>

{#if data.data?.recent.length}
	<h2 class="mk-h">Последние находки</h2>
	<div class="bx-recent">
		{#each data.data.recent as o (o._id)}
			{@const Icon = iconFor(o.dropId)}
			<span class="bx-recent__item">
				<Icon size={16} strokeWidth={2.25} />{describe(o.prize).title}
			</span>
		{/each}
	</div>
{/if}

{#if result}
	{@const Icon = iconFor(result.dropId)}
	{@const info = describe(result.prize)}
	<div class="app-modal" role="dialog" aria-modal="true" aria-label="Награда из бокса">
		<div class="app-modal__box bx-result">
			<span class="bx-result__kicker">Из бокса выпало</span>
			<span class="bx-result__icon bx-drop__icon--{tones[result.dropId] ?? 'white'}">
				{#if pictures[result.dropId]}
					<img src={pictures[result.dropId]} alt="" draggable="false" />
				{:else}
					<Icon size={44} strokeWidth={2.25} />
				{/if}
			</span>
			<h3 class="bx-result__title">{info.title}</h3>
			<p class="bx-result__text">{info.text}</p>
			{#if result.prize.kind === 'coupon'}
				<span class="mk-code">{result.prize.code}</span>
			{/if}
			<div class="bx-result__row">
				<Button color="gray" size="small" onclick={() => (result = null)}>Закрыть</Button>
				{#if result.owned > 0}
					<Button color="black" size="small" onclick={again}
						>Ещё один · осталось {result.owned}</Button
					>
				{:else if result.leftToday > 0 && premium >= price}
					<Button color="black" size="small" onclick={again}>
						Ещё один&nbsp;<Price value={price} kind="premium" />
					</Button>
				{/if}
			</div>
		</div>
	</div>
{/if}

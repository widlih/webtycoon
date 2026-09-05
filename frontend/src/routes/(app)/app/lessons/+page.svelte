<script lang="ts">
	import { Check, Lock } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import Button from '$lib/landing/Button.svelte';
	import Price from '$lib/landing/Price.svelte';
	import MarketCard from '$lib/market/MarketCard.svelte';
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api';
	import { PRODUCT_TITLES, PRODUCTS, type Product } from '../../../../convex/model/constants';

	let product = $state<Product>('rusender');
	const lessons = useQuery(api.lessons.list, () => ({ product }));

	const done = $derived(lessons.data?.filter((l) => l.completed).length ?? 0);
	const total = $derived(lessons.data?.length ?? 0);
	const firstOpen = $derived(lessons.data?.findIndex((l) => !l.completed) ?? -1);
</script>

<main class="lp-container app-page">
	<div class="app-toolbar">
		<div class="app-toolbar__group">
			{#each PRODUCTS as p (p)}
				<button
					class="app-chip app-chip--gray"
					class:is-active={product === p}
					onclick={() => (product = p)}
				>
					{PRODUCT_TITLES[p]}
				</button>
			{/each}
		</div>
		<span class="app-muted">Пройдено {done} из {total}</span>
	</div>

	{#if lessons.isLoading}
		<p class="app-hint">Загрузка…</p>
	{:else if lessons.data && lessons.data.length === 0}
		<p class="app-hint">Уроки по этому отделу скоро появятся</p>
	{:else if lessons.data}
		<div class="mk-grid mk-grid--compact">
			{#each lessons.data as lesson, i (lesson.slug)}
				{@const locked = !lesson.completed && i !== firstOpen}
				<MarketCard
					title={lesson.title}
					compact
					class={locked ? 'mk-card--locked' : lesson.completed ? 'mk-card--done' : ''}
					corner={locked ? 'Закрыто' : lesson.completed ? 'Пройден' : undefined}
				>
					{#snippet media()}Урок {i + 1}{/snippet}
					<p class="mk-card__text">
						<Price value={lesson.reward.coins} prefix="+" /> · <Price
							value={lesson.reward.xp}
							kind="xp"
							prefix="+"
						/>
					</p>
					{#snippet foot()}
						{#if locked}
							<p class="mk-card__hint"><Lock size={14} strokeWidth={2.5} /> Сначала предыдущий урок</p>
						{:else if lesson.completed}
							<Button
								color="gray"
								size="small"
								href={resolve('/(app)/app/lessons/[slug]', { slug: lesson.slug })}
							>
								<Check size={18} strokeWidth={2.5} />Повторить
							</Button>
						{:else}
							<Button
								color="black"
								size="small"
								href={resolve('/(app)/app/lessons/[slug]', { slug: lesson.slug })}
							>
								Начать
							</Button>
						{/if}
					{/snippet}
				</MarketCard>
			{/each}
		</div>
	{/if}
</main>

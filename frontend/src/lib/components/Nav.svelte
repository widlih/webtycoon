<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Building2, GraduationCap, ListChecks, ShoppingBag, Trophy } from '@lucide/svelte';
	import { useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';

	const items = [
		{ href: '/app', label: 'Офис', icon: Building2 },
		{ href: '/app/lessons', label: 'Обучение', icon: GraduationCap },
		{ href: '/app/quests', label: 'Задания', icon: ListChecks },
		{ href: '/app/market', label: 'Маркет', icon: ShoppingBag },
		{ href: '/app/leaderboard', label: 'Рейтинг', icon: Trophy }
	] as const;

	const quests = useQuery(api.quests.list, {});
	const readyQuests = $derived(quests.data?.quests.filter((q) => q.completed).length ?? 0);

	const isActive = (href: string) =>
		href === '/app' ? page.url.pathname === '/app' : page.url.pathname.startsWith(href);
</script>

<nav class="app-nav">
	<div class="lp-container">
		<div class="app-nav__bar">
			{#each items as item (item.href)}
				<a
					class="app-nav__link"
					href={resolve(item.href)}
					aria-current={isActive(item.href) ? 'page' : undefined}
				>
					<item.icon size={20} strokeWidth={2} />
					<span>{item.label}</span>
					{#if item.href === '/app/quests' && readyQuests > 0}<span class="app-nav__dot"
							>{readyQuests}</span
						>{/if}
				</a>
			{/each}
		</div>
	</div>
</nav>

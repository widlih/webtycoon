<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Building2, GraduationCap, ListChecks, ShoppingBag, Trophy } from '@lucide/svelte';

	const items = [
		{ href: '/app', label: 'Офис', icon: Building2 },
		{ href: '/app/lessons', label: 'Обучение', icon: GraduationCap },
		{ href: '/app/quests', label: 'Задания', icon: ListChecks },
		{ href: '/app/market', label: 'Маркет', icon: ShoppingBag },
		{ href: '/app/leaderboard', label: 'Рейтинг', icon: Trophy }
	] as const;

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
				</a>
			{/each}
		</div>
	</div>
</nav>

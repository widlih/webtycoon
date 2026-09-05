<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Menu, X } from '@lucide/svelte';
	import Button from './Button.svelte';

	let { links = [] }: { links?: { label: string; href: string }[] } = $props();

	let isIn = $state(false);
	let isSticky = $state(false);
	let isMinimized = $state(false);
	let menuOpen = $state(false);
	let lastY = 0;

	function onScroll() {
		const y = window.scrollY;
		isSticky = y > 1;
		if (y > lastY) isMinimized = y > 1;
		else isMinimized = false;
		lastY = y;
	}

	onMount(() => {
		lastY = window.scrollY;
		onScroll();
		requestAnimationFrame(() => (isIn = true));
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	let menuShown = $state(false);

	$effect(() => {
		document.body.style.overflow = menuOpen ? 'hidden' : '';
		if (menuOpen) {
			const t = setTimeout(() => (menuShown = true), 10);
			return () => clearTimeout(t);
		}
		menuShown = false;
	});

	function toggleMenu() {
		if (window.innerWidth >= 1025 && !menuOpen && isMinimized) {
			isMinimized = false;
			return;
		}
		menuOpen = !menuOpen;
	}
</script>

<header
	class="lp-header"
	class:is-in={isIn}
	class:is-sticky={isSticky}
	class:is-minimized={isMinimized}
	class:is-menu-open={menuOpen}
>
	<div class="lp-header__inner">
		<div class="lp-container" style="position:relative">
			<div class="lp-header__bg"></div>
			<div class="lp-header__content">
				<div class="lp-header__left">
					<div class="lp-header__logo"><a href={resolve('/')}>WebTycoon</a></div>
					<nav class="lp-header__links">
						<ul>
							{#each links as link (link.href)}
								<li class="lp-header__navitem">
									<a class="lp-header__link" href={link.href}>{link.label}</a>
								</li>
							{/each}
						</ul>
					</nav>
				</div>
			</div>
		</div>
		<div class="lp-header__right">
			<div class="lp-container">
				<div class="lp-header__buttons">
					{#if !page.url.pathname.startsWith('/login')}
						<div class="lp-header__pre">
							<Button href={resolve('/login')} color="black" size="small" class="lp-header__cta"
								>Войти</Button
							>
						</div>
					{/if}
					<div class="lp-header__burger-wrap">
						<Button
							color="white"
							size="small"
							class="lp-header__burger"
							label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
							onclick={toggleMenu}
						>
							{#if menuOpen}<X size={20} strokeWidth={2.25} />{:else}<Menu
									size={20}
									strokeWidth={2.25}
								/>{/if}
						</Button>
					</div>
				</div>
			</div>
		</div>
	</div>
</header>

{#if menuOpen}
	<div class="lp-menu" class:is-open={menuShown}>
		<div class="lp-menu__inner">
			<div class="lp-menu__scroll">
				<div class="lp-container">
					<ul class="lp-menu__list">
						{#each links as link (link.href)}
							<li class="lp-menu__item">
								<a class="lp-menu__link" href={link.href} onclick={() => (menuOpen = false)}
									>{link.label}</a
								>
							</li>
						{/each}
						{#if !page.url.pathname.startsWith('/login')}
							<li class="lp-menu__item">
								<a class="lp-menu__link" href={resolve('/login')}>Войти</a>
							</li>
						{/if}
					</ul>
				</div>
			</div>
			<div class="lp-menu__footer">
				<div class="lp-container">
					<Button href={resolve('/login')} color="black" size="medium">Начать бесплатно</Button>
				</div>
			</div>
		</div>
	</div>
{/if}

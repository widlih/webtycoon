<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Balance from '$lib/components/Balance.svelte';
	import Nav from '$lib/components/Nav.svelte';
	import { initConvex } from '$lib/convex.svelte';
	import { useAuth, useMutation, useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';
	import '$lib/landing/landing.css';
	import '$lib/landing/app.css';
	import { onMount } from 'svelte';
	import { initMusic } from '$lib/fx/music.svelte';

	let { children } = $props();
	onMount(initMusic);
	initConvex();
	const auth = useAuth();
	const me = useQuery(api.players.me, () => (auth.isAuthenticated ? {} : 'skip'));
	const ensure = useMutation(api.players.ensure);

	$effect(() => {
		if (!auth.isLoading && !auth.isAuthenticated) goto(resolve('/'));
	});

	$effect(() => {
		if (auth.isAuthenticated && !me.isLoading && !me.error && me.data === null) ensure({});
	});
</script>

<div class="lp app">
	{#if auth.isLoading}
		<p class="app-hint">Загрузка…</p>
	{:else if auth.isAuthenticated}
		<Balance />
		{@render children()}
		<Nav />
	{/if}
</div>

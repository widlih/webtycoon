<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		tag,
		title,
		text,
		level = 'h2',
		class: className = '',
		button
	}: {
		tag?: string;
		title: string;
		text?: string;
		level?: 'h1' | 'h2';
		class?: string;
		button?: Snippet;
	} = $props();
</script>

<header class="lp-sh {className}">
	<div class="lp-container">
		{#if tag}
			<div class="lp-sh__tag"><span class="lp-pill">{tag}</span></div>
		{/if}
		{#if level === 'h1'}
			<h1 class="lp-h1">{@html title}</h1>
		{:else}
			<h2 class="lp-h2">{@html title}</h2>
		{/if}
		{#if text}
			<div class="lp-sh__text">{@html text}</div>
		{/if}
		{#if button}
			<div class="lp-sh__button">{@render button()}</div>
		{/if}
	</div>
</header>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ArrowRight } from '@lucide/svelte';

	let {
		href,
		color = 'black',
		size = 'small',
		type = 'button',
		disabled = false,
		class: className = '',
		arrow = false,
		onclick,
		label,
		children
	}: {
		href?: string;
		color?: 'violet' | 'black' | 'gray' | 'white' | 'yellow';
		size?: 'small' | 'medium' | 'large';
		type?: 'button' | 'submit';
		disabled?: boolean;
		class?: string;
		arrow?: boolean;
		onclick?: (e: MouseEvent) => void;
		label?: string;
		children: Snippet;
	} = $props();

	const cls = $derived(`lp-btn lp-btn--${color} lp-btn--${size} ${className}`);
</script>

{#if href}
	<a class={cls} {href} aria-label={label} {onclick}>
		<span class="lp-btn__inner">
			{@render children()}
			{#if arrow}<ArrowRight size={18} strokeWidth={2.25} />{/if}
		</span>
	</a>
{:else}
	<button class={cls} {type} {disabled} aria-label={label} {onclick}>
		<span class="lp-btn__inner">
			{@render children()}
			{#if arrow}<ArrowRight size={18} strokeWidth={2.25} />{/if}
		</span>
	</button>
{/if}

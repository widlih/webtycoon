<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '$lib/landing/Button.svelte';
	import Price from '$lib/landing/Price.svelte';

	let {
		title,
		text,
		big,
		image,
		tag,
		price,
		currency = 'coins',
		corner,
		hint,
		disabled = false,
		class: className = '',
		compact = false,
		onbuy,
		media,
		children,
		foot
	}: {
		title: string;
		text?: string;
		big?: string;
		image?: string;
		tag?: string;
		price?: number;
		currency?: 'coins' | 'premium';
		corner?: string;
		hint?: string;
		disabled?: boolean;
		class?: string;
		compact?: boolean;
		onbuy?: () => void;
		media?: Snippet;
		children?: Snippet;
		foot?: Snippet;
	} = $props();
</script>

<div class="mk-card {className}" class:mk-card--compact={compact}>
	{#if corner}<span class="mk-card__corner">{corner}</span>{/if}
	{#if !compact}
		<div class="mk-card__media">
			{#if image}
				<img src={image} alt="" />
			{:else if media}
				<span class="mk-card__big">{@render media()}</span>
			{:else if big}
				<span class="mk-card__big">{big}</span>
			{/if}
		</div>
	{/if}
	<div class="mk-card__body">
		{#if compact && media}<span class="mk-card__badge">{@render media()}</span>
		{:else if compact && big}<span class="mk-card__badge">{big}</span>{/if}
		{#if tag}<span class="mk-card__tag">{tag}</span>{/if}
		<h3 class="mk-card__title">{title}</h3>
		{#if text}<p class="mk-card__text">{text}</p>{/if}
		{@render children?.()}
	</div>
	{#if price !== undefined || hint || foot}
		<div class="mk-card__foot">
			{@render foot?.()}
			{#if price !== undefined}
				<Button color={disabled ? 'gray' : 'black'} size="small" {disabled} onclick={onbuy}>
					<Price value={price} kind={currency} />
				</Button>
			{/if}
			{#if hint}<p class="mk-card__hint">{hint}</p>{/if}
		</div>
	{/if}
</div>

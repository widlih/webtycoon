<script lang="ts">
	import { Coins, Gem, Package, Star, Zap } from '@lucide/svelte';

	let {
		value,
		kind = 'coins',
		prefix = ''
	}: {
		value: number | string;
		kind?: 'coins' | 'premium' | 'xp' | 'energy' | 'box';
		prefix?: string;
	} = $props();

	const icons = { coins: Coins, premium: Gem, xp: Star, energy: Zap, box: Package };
	const Icon = $derived(icons[kind]);
</script>

<span class="app-price app-price--{kind}"><Icon size={16} strokeWidth={2.25} />{prefix}{value}</span
>

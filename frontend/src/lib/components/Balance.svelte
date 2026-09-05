<script lang="ts">
	import { resolve } from '$app/paths';
	import { Coins, Gem, Zap } from '@lucide/svelte';
	import { useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';

	const me = useQuery(api.players.me, {});
	const initial = $derived((me.data?.nick ?? '?').trim().charAt(0).toUpperCase() || '?');
</script>

<header class="app-header">
	<div class="lp-container">
		<div class="app-header__bar">
			<a class="app-header__logo" href={resolve('/app')}>WebTycoon</a>
			<div class="app-header__stats">
				<span class="app-pill" title="Монеты"
					><Coins size={18} strokeWidth={2.25} />{me.data?.coins ?? 0}</span
				>
				<span class="app-pill app-pill--premium" title="Премиум"
					><Gem size={18} strokeWidth={2.25} />{me.data?.premium ?? 0}</span
				>
				<span class="app-pill" title="Энергия"
					><Zap size={18} strokeWidth={2.25} />{me.data?.energy ?? 0}/{me.data?.energyMax ??
						8}</span
				>
				<a class="app-pill app-pill--player" href={resolve('/app/profile')}>
					<span class="app-pill__avatar">{initial}</span>
					<span class="app-pill__nick">{me.data?.nick ?? ''}</span>
					<span class="app-pill__sub">{me.data?.level ?? 1} ур.</span>
				</a>
			</div>
		</div>
	</div>
</header>

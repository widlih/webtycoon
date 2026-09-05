<script lang="ts">
	import MarketCard from '$lib/market/MarketCard.svelte';
	import Button from '$lib/landing/Button.svelte';
	import { Copy } from '@lucide/svelte';
	import { useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';

	const mine = useQuery(api.coupons.mine, {});
	const now = Date.now();
	const format = (ms: number) => new Date(ms).toLocaleDateString('ru-RU');
</script>

<h2 class="mk-h">Мои купоны</h2>
{#if (mine.data?.length ?? 0) === 0}
	<p class="app-muted mk-note">Пока нет купонов.</p>
{:else}
	<div class="mk-grid">
		{#each mine.data ?? [] as c (c._id)}
			{@const expired = c.expiresAt < now}
			<MarketCard
				title={c.title}
				big={c.code}
				text={expired ? 'Истёк' : `Действует до ${format(c.expiresAt)}`}
			>
				{#snippet foot()}
					<Button
						color={expired ? 'gray' : 'black'}
						size="small"
						onclick={() => navigator.clipboard.writeText(c.code)}
					>
						<Copy size={18} strokeWidth={2.25} />Копировать код
					</Button>
				{/snippet}
			</MarketCard>
		{/each}
	</div>
{/if}

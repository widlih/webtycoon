<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import type { WidgetProps } from '..';

	let { onaction }: WidgetProps = $props();

	const rows = [
		{ name: 'Скидки недели', status: 'Отправлена', date: '28 авг' },
		{ name: 'Новинки сентября', status: 'Черновик', date: '2 сен' },
		{ name: 'Опрос после покупки', status: 'Запланирована', date: '5 сен' }
	];
</script>

<div class="rs">
	<div class="rs__bar">
		<span class="rs__title">Рассылки</span>
		<div class="rs__actions">
			<button
				class="rs__btn rs__btn--ghost"
				onclick={() => onaction({ kind: 'click', value: 'templates' })}>Шаблоны</button
			>
			<button
				class="rs__btn rs__btn--ghost"
				onclick={() => onaction({ kind: 'click', value: 'contacts' })}>Контакты</button
			>
			<button
				class="rs__btn rs__btn--primary"
				onclick={() => onaction({ kind: 'click', value: 'create' })}
			>
				<Plus size={14} strokeWidth={2.5} /> Создать рассылку
			</button>
		</div>
	</div>
	<ul class="rs__list">
		{#each rows as row (row.name)}
			<li class="rs__row">
				<span>{row.name}</span>
				<span class="rs__muted">{row.status}</span>
				<span class="rs__muted">{row.date}</span>
			</li>
		{/each}
	</ul>
</div>

<style>
	.rs {
		display: grid;
		gap: 12px;
		font: 400 15px/140% var(--text-font);
		color: var(--ink);
		letter-spacing: -0.3px;
	}
	.rs__title {
		font: 600 18px/1 var(--display);
		letter-spacing: -0.36px;
	}
	.rs__muted {
		color: var(--muted);
		font-size: 14px;
	}

	.rs__bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
	}
	.rs__actions {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}
	.rs__btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		border: 0;
		border-radius: 20px;
		height: 36px;
		padding: 0 14px;
		background: #fff;
		color: var(--ink);
		font: 600 14px/1 var(--display);
		letter-spacing: -0.28px;
		cursor: pointer;
		transition: transform 0.3s var(--ease-overshoot-linear);
	}
	.rs__btn:hover {
		transform: scale(1.04);
	}
	.rs__btn--primary {
		background: var(--ink);
		color: #fff;
	}
	.rs__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 6px;
	}
	.rs__row {
		display: grid;
		grid-template-columns: 1fr auto auto;
		gap: 12px;
		padding: 12px 16px;
		border-radius: 14px;
		background: #fff;
	}
</style>

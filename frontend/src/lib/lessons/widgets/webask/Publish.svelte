<script lang="ts">
	import { Code2, Copy, Link, Mail, QrCode } from '@lucide/svelte';
	import type { WidgetProps } from '..';

	let { step, onaction }: WidgetProps = $props();

	const options = $derived(step.type === 'choose' ? step.options : []);
	const tabs = [
		{ id: 'link', label: 'Ссылка', icon: Link },
		{ id: 'widget', label: 'Виджет', icon: Code2 },
		{ id: 'qr', label: 'QR-код', icon: QrCode },
		{ id: 'email', label: 'Email', icon: Mail }
	];
	const icons = [QrCode, Mail, Code2, Link];
	let tab = $state('link');
	let picked = $state<number | null>(null);
	let published = $state(false);
</script>

<div class="wg">
	<div class="wg__bar">
		<span class="wg__title">Публикация</span>
		<button
			class="wg__btn wg__btn--primary"
			onclick={() => {
				published = true;
				onaction({ kind: 'click', value: 'publish' });
			}}>{published ? 'Опубликован' : 'Опубликовать'}</button
		>
	</div>
	{#if step.type === 'choose'}
		<div class="wg__grid">
			{#each options as option, i (option)}
				{@const Icon = icons[i % icons.length]}
				<button
					class="wg__card"
					class:is-picked={picked === i}
					onclick={() => {
						picked = i;
						onaction({ kind: 'choose', value: i });
					}}
				>
					<span class="wg__icon"><Icon size={16} strokeWidth={2.25} /></span>
					<span class="wg__name">{option}</span>
				</button>
			{/each}
		</div>
	{:else}
		<div class="wg__tabs">
			{#each tabs as t (t.id)}
				<button
					class="wg__tab"
					class:is-active={tab === t.id}
					onclick={() => {
						tab = t.id;
						onaction({ kind: 'click', value: `tab:${t.id}` });
					}}>{t.label}</button
				>
			{/each}
		</div>
		<div class="wg__panel">
			<label class="wg__field">
				<span class="wg__label">Ссылка на опрос</span>
				<input class="wg__input" value="https://webask.io/s/dostavka-avgust" disabled />
			</label>
			<div class="wg__bar">
				<span class="wg__muted">Работает на всех устройствах · брендинг WebAsk скрыт</span>
				<button
					class="wg__btn wg__btn--soft"
					onclick={() => onaction({ kind: 'click', value: 'copy' })}
				>
					<Copy size={14} strokeWidth={2.25} /> Копировать ссылку
				</button>
			</div>
		</div>
	{/if}
</div>

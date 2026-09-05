<script lang="ts">
	import { Code2, Copy, Link, Mail, QrCode, Share2 } from '@lucide/svelte';
	import Choices from '../common/Choices.svelte';
	import type { WidgetProps } from '..';

	let { step, onaction }: WidgetProps = $props();

	const choose = $derived(step.type === 'choose' ? step : null);
	const title = $derived(choose?.title ?? 'Публикация');
	const note = $derived(
		choose?.note ?? 'Черновик не принимает ответы. После публикации опрос получает ссылку'
	);

	const tabs = [
		{ id: 'link', label: 'Ссылка' },
		{ id: 'widget', label: 'Виджет' },
		{ id: 'qr', label: 'QR-код' },
		{ id: 'email', label: 'Email' }
	];
	const icons: Array<[RegExp, typeof Link]> = [
		[/qr/i, QrCode],
		[/email|почт|рассылк/i, Mail],
		[/виджет|сайт/i, Code2],
		[/соцсет/i, Share2]
	];
	const iconFor = (text: string) => icons.find(([re]) => re.test(text))?.[1] ?? Link;

	let tab = $state('link');
	let clicked = $state(false);
	// На шаге «Опубликовать» опрос ещё черновик, на остальных уже опубликован
	const published = $derived(clicked || step.type !== 'click' || step.target !== 'publish');
	let copied = $state(false);
</script>

<div class="wg">
	<div class="wg__bar">
		<div class="wg__head">
			<span class="wg__title">{title}</span>
			<span class="wg__note">{note}</span>
		</div>
		<button
			type="button"
			class="wg__btn wg__btn--primary"
			onclick={() => {
				clicked = true;
				onaction({ kind: 'click', value: 'publish' });
			}}>{published ? 'Опубликован' : 'Опубликовать'}</button
		>
	</div>
	{#if choose}
		<Choices
			options={choose.options}
			meta={choose.meta ?? []}
			icon={iconFor}
			onpick={(i) => onaction({ kind: 'choose', value: i })}
		/>
	{:else}
		<div class="wg__tabs">
			{#each tabs as t (t.id)}
				<button
					type="button"
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
				<input class="wg__input" value="https://webask.io/s/dostavka-sentyabr" disabled />
				<span class="wg__help">
					Одна ссылка для всех каналов: её можно вставить в письмо, превратить в QR-код или встроить
					виджетом на сайт.
				</span>
			</label>
			<div class="wg__bar">
				<span class="wg__muted">Открывается на любом устройстве</span>
				<button
					type="button"
					class="wg__btn wg__btn--soft"
					onclick={() => {
						copied = true;
						onaction({ kind: 'click', value: 'copy' });
					}}
				>
					<Copy size={14} strokeWidth={2.25} />
					{copied ? 'Скопировано' : 'Копировать ссылку'}
				</button>
			</div>
		</div>
	{/if}
</div>

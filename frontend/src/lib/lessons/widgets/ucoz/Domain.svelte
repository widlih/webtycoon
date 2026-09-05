<script lang="ts">
	import { Clock, Globe, Server, ShieldCheck } from '@lucide/svelte';
	import Choices from '../common/Choices.svelte';
	import type { WidgetProps } from '..';

	let { step, onaction, wrong }: WidgetProps = $props();

	const choose = $derived(step.type === 'choose' ? step : null);
	const input = $derived(step.type === 'input' ? step : null);
	const title = $derived(step.title ?? 'Домены и SSL · Управление доменами');
	const note = $derived(
		step.note ?? 'Домен покупают у регистратора, а здесь прикрепляют к сайту на uCoz'
	);

	const icons: Array<[RegExp, typeof Globe]> = [
		[/ns\d|сервер/i, Server],
		[/подожд|час|dns/i, Clock],
		[/ssl|сертифик/i, ShieldCheck]
	];
	const iconFor = (text: string) => icons.find(([re]) => re.test(text))?.[1] ?? Globe;

	let domain = $state('');
	let attached = $state(false);
</script>

<div class="wg">
	<div class="wg__head">
		<span class="wg__title">{title}</span>
		<span class="wg__note">{note}</span>
	</div>
	<div class="wg__panel">
		<label class="wg__field">
			<span class="wg__label">Ваш домен</span>
			<input
				class="wg__input"
				class:is-active={Boolean(input)}
				class:is-wrong={wrong && Boolean(input)}
				disabled={!input}
				bind:value={domain}
				oninput={() => onaction({ kind: 'input', value: domain })}
				placeholder={input?.placeholder ?? 'ulybka-dental.ru'}
				maxlength="60"
			/>
			<span class="wg__help">
				Только имя домена: без https://, слэшей и пробелов. Так uCoz поймёт, какой адрес ждать.
			</span>
		</label>

		{#if choose}
			<Choices
				options={choose.options}
				meta={choose.meta ?? []}
				icon={iconFor}
				onpick={(i) => onaction({ kind: 'choose', value: i })}
			/>
		{/if}

		<div class="wg__bar">
			<span class="wg__muted">На бесплатном тарифе один домен, на платных до пяти</span>
			<button
				type="button"
				class="wg__btn wg__btn--primary"
				onclick={() => {
					attached = true;
					onaction({ kind: 'click', value: 'attach' });
				}}>{attached ? 'Домен прикреплён' : 'Прикрепить домен'}</button
			>
		</div>
	</div>
</div>

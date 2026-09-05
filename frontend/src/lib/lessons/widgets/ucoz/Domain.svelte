<script lang="ts">
	import { Globe } from '@lucide/svelte';
	import type { WidgetProps } from '..';

	let { step, onaction, wrong }: WidgetProps = $props();

	const options = $derived(step.type === 'choose' ? step.options : []);
	let domain = $state('');
	let picked = $state<number | null>(null);
</script>

<div class="wg">
	<span class="wg__title">Настройки · Перенос домена</span>
	<div class="wg__panel">
		<label class="wg__field">
			<span class="wg__label">Ваш домен</span>
			<input
				class="wg__input"
				class:is-wrong={wrong && step.type === 'input'}
				disabled={step.type !== 'input'}
				bind:value={domain}
				oninput={() => onaction({ kind: 'input', value: domain })}
				placeholder="например, ulybka-dental.ru"
				maxlength="60"
			/>
		</label>
		<span class="wg__muted">
			У регистратора укажите NS-серверы uCoz. Делегирование зоны .ru занимает до 9 часов, .рф до 2
			часов.
		</span>
		{#if step.type === 'choose'}
			<div class="wg__grid">
				{#each options as option, i (option)}
					<button
						class="wg__card"
						class:is-picked={picked === i}
						onclick={() => {
							picked = i;
							onaction({ kind: 'choose', value: i });
						}}
					>
						<span class="wg__icon"><Globe size={16} strokeWidth={2.25} /></span>
						<span class="wg__name">{option}</span>
					</button>
				{/each}
			</div>
		{/if}
		<div class="wg__bar">
			<span class="wg__muted">К сайту можно прикрепить до 5 доменов</span>
			<button
				class="wg__btn wg__btn--primary"
				onclick={() => onaction({ kind: 'click', value: 'attach' })}>Прикрепить домен</button
			>
		</div>
	</div>
</div>

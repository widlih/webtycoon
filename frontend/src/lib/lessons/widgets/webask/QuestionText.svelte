<script lang="ts">
	import { Check, Plus, Trophy } from '@lucide/svelte';
	import type { WidgetProps } from '..';

	let { step, onaction, wrong }: WidgetProps = $props();

	const input = $derived(step.type === 'input' ? step : null);
	const click = $derived(step.type === 'click' ? step : null);
	const title = $derived(step.title ?? 'Вопрос 1 · Один из списка');
	const note = $derived(step.note ?? 'Респондент видит только текст вопроса и варианты ответа');
	const placeholder = $derived(input?.placeholder ?? 'Сформулируйте вопрос нейтрально');
	const max = $derived(input?.maxLength ?? 120);
	/** Для шкалы показываем линейку вместо вариантов */
	const isScale = $derived(/шкал/i.test(title));

	let text = $state('');
	let required = $state(false);
	let points = $state(false);
	let variants = $state(['Курьер опоздал', 'Заказ перепутали', 'Долго готовили']);

	function toggle(id: 'required' | 'points') {
		if (id === 'required') required = !required;
		else points = !points;
		onaction({ kind: 'click', value: id });
	}
</script>

<div class="wg">
	<div class="wg__head">
		<span class="wg__title">{title}</span>
		<span class="wg__note">{note}</span>
	</div>
	<div class="wg__panel">
		<label class="wg__field">
			<span class="wg__label">Текст вопроса</span>
			<input
				class="wg__input"
				class:is-active={Boolean(input)}
				class:is-wrong={wrong && Boolean(input)}
				disabled={!input}
				bind:value={text}
				oninput={() => onaction({ kind: 'input', value: text })}
				{placeholder}
				maxlength="160"
			/>
			<span class="wg__counter">{text.length} / {max}</span>
			<span class="wg__help">
				Один вопрос — один смысл. Без подсказки ответа вроде «вам же понравилось?».
			</span>
		</label>

		{#if isScale}
			<span class="wg__label">Шкала ответа</span>
			<div class="wg__scale" aria-hidden="true">
				{#each Array.from({ length: 10 }, (_, i) => i + 1) as n (n)}<span>{n}</span>{/each}
			</div>
			<div class="wg__scale-ends">
				<span>1 · совсем не доволен</span><span>10 · очень доволен</span>
			</div>
		{:else}
			<span class="wg__label">Варианты ответа</span>
			<ul class="wg__list">
				{#each variants as v, i (i)}
					<li class="wg__row"><span>{v}</span><span class="wg__muted">{i + 1}</span></li>
				{/each}
			</ul>
		{/if}

		<div class="wg__bar">
			{#if !isScale}
				<button
					type="button"
					class="wg__btn wg__btn--soft"
					disabled={variants.includes('Другое')}
					onclick={() => {
						variants = [...variants, 'Другое'];
						onaction({ kind: 'click', value: 'addOption' });
					}}><Plus size={14} strokeWidth={2.5} /> Добавить вариант</button
				>
			{:else}
				<span></span>
			{/if}
			<div class="wg__actions">
				<button
					type="button"
					class="wg__check"
					class:is-on={required}
					onclick={() => toggle('required')}
				>
					<span class="wg__box"
						>{#if required}<Check size={14} strokeWidth={3} />{/if}</span
					>
					Обязательный ответ
				</button>
				<button
					type="button"
					class="wg__check"
					class:is-on={points}
					onclick={() => toggle('points')}
				>
					<span class="wg__box"
						>{#if points}<Check size={14} strokeWidth={3} />{/if}</span
					>
					<Trophy size={14} strokeWidth={2.25} /> Баллы
				</button>
			</div>
		</div>
		<span class="wg__help">
			«Обязательный ответ» не даст перейти дальше без ответа. «Баллы» включают скоринг: за верный
			ответ начисляются очки, и вопрос становится тестовым.
		</span>
		{#if click?.target === 'addOption'}
			<span class="wg__help">Вариант «Другое» появится в конце списка.</span>
		{/if}
	</div>
</div>

<script lang="ts">
	import { Check, Plus, Trophy } from '@lucide/svelte';
	import type { WidgetProps } from '..';

	let { step, onaction, wrong }: WidgetProps = $props();

	let text = $state('');
	let required = $state(false);
	let points = $state(false);
	let variants = $state(['Очень доволен', 'Скорее доволен', 'Не доволен']);

	function toggle(id: 'required' | 'points') {
		if (id === 'required') required = !required;
		else points = !points;
		onaction({ kind: 'click', value: id });
	}
</script>

<div class="wg">
	<span class="wg__title">Вопрос 1 · Один из списка</span>
	<div class="wg__panel">
		<label class="wg__field">
			<span class="wg__label">Текст вопроса</span>
			<input
				class="wg__input"
				class:is-wrong={wrong && step.type === 'input'}
				disabled={step.type !== 'input'}
				bind:value={text}
				oninput={() => onaction({ kind: 'input', value: text })}
				placeholder="Сформулируйте вопрос нейтрально, один смысл на вопрос"
				maxlength="160"
			/>
			<span class="wg__counter">{text.length} / 120</span>
		</label>
		<span class="wg__label">Варианты ответа</span>
		<ul class="wg__list">
			{#each variants as v, i (i)}
				<li class="wg__row"><span>{v}</span><span class="wg__muted">{i + 1}</span></li>
			{/each}
		</ul>
		<div class="wg__bar">
			<button
				class="wg__btn wg__btn--soft"
				onclick={() => {
					variants = [...variants, 'Другое'];
					onaction({ kind: 'click', value: 'addOption' });
				}}><Plus size={14} strokeWidth={2.5} /> Добавить вариант</button
			>
			<div class="wg__actions">
				<button class="wg__check" class:is-on={required} onclick={() => toggle('required')}>
					<span class="wg__box"
						>{#if required}<Check size={14} strokeWidth={3} />{/if}</span
					>
					Обязательный
				</button>
				<button class="wg__check" class:is-on={points} onclick={() => toggle('points')}>
					<span class="wg__box"
						>{#if points}<Check size={14} strokeWidth={3} />{/if}</span
					>
					<Trophy size={14} strokeWidth={2.25} /> Баллы
				</button>
			</div>
		</div>
	</div>
</div>

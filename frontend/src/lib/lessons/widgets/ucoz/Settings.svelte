<script lang="ts">
	import type { WidgetProps } from '..';

	let { step, onaction, wrong }: WidgetProps = $props();

	const field = $derived(step.type === 'input' ? step.field : null);
	let values = $state<Record<string, string>>({ name: '', title: '', description: '' });

	function input(id: string) {
		if (id === field) onaction({ kind: 'input', value: values[id] });
	}
</script>

<div class="wg">
	<span class="wg__title">Настройки · Общие настройки</span>
	<div class="wg__panel">
		<label class="wg__field">
			<span class="wg__label">Название вашего сайта</span>
			<input
				class="wg__input"
				class:is-active={field === 'name'}
				class:is-wrong={wrong && field === 'name'}
				disabled={field !== 'name'}
				bind:value={values.name}
				oninput={() => input('name')}
				placeholder="Например: Стоматология «Улыбка»"
				maxlength="60"
			/>
		</label>
		<label class="wg__field">
			<span class="wg__label">URL-адрес вашего сайта</span>
			<input class="wg__input" value="https://ulybka.ucoz.ru" disabled />
		</label>
		<label class="wg__field">
			<span class="wg__label">Title (заголовок главной)</span>
			<input
				class="wg__input"
				class:is-active={field === 'title'}
				class:is-wrong={wrong && field === 'title'}
				disabled={field !== 'title'}
				bind:value={values.title}
				oninput={() => input('title')}
				placeholder="Услуга и город, до 70 знаков"
				maxlength="90"
			/>
			<span class="wg__counter">{values.title.length} / 70</span>
		</label>
		<label class="wg__field">
			<span class="wg__label">Meta Description</span>
			<input
				class="wg__input"
				class:is-active={field === 'description'}
				class:is-wrong={wrong && field === 'description'}
				disabled={field !== 'description'}
				bind:value={values.description}
				oninput={() => input('description')}
				placeholder="Одно-два предложения о сайте для поисковой выдачи"
				maxlength="200"
			/>
			<span class="wg__counter">{values.description.length} / 160</span>
		</label>
		<div class="wg__bar">
			<span class="wg__muted">Дизайн сайта: №2301 · Язык: русский · Местное время: Москва</span>
			<button
				class="wg__btn wg__btn--primary"
				onclick={() => onaction({ kind: 'click', value: 'save' })}>Сохранить</button
			>
		</div>
	</div>
</div>

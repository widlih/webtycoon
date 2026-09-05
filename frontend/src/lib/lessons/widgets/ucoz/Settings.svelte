<script lang="ts">
	import type { WidgetProps } from '..';

	let { step, onaction, wrong }: WidgetProps = $props();

	const input = $derived(step.type === 'input' ? step : null);
	const field = $derived(input?.field ?? null);
	const title = $derived(step.title ?? 'Настройки · Общие настройки');
	const note = $derived(step.note ?? 'Активно только поле, которое нужно заполнить на этом шаге');
	const placeholder = (id: string, fallback: string) =>
		field === id && input?.placeholder ? input.placeholder : fallback;

	let values = $state<Record<string, string>>({ name: '', title: '', description: '' });

	function change(id: string) {
		if (id === field) onaction({ kind: 'input', value: values[id] });
	}
</script>

<div class="wg">
	<div class="wg__head">
		<span class="wg__title">{title}</span>
		<span class="wg__note">{note}</span>
	</div>
	<div class="wg__panel">
		<label class="wg__field">
			<span class="wg__label">Название вашего сайта</span>
			<input
				class="wg__input"
				class:is-active={field === 'name'}
				class:is-wrong={wrong && field === 'name'}
				disabled={field !== 'name'}
				bind:value={values.name}
				oninput={() => change('name')}
				placeholder={placeholder('name', 'Например: Стоматология «Улыбка»')}
				maxlength="60"
			/>
			<span class="wg__help">Показывается в шапке сайта и во вкладке браузера.</span>
		</label>

		<label class="wg__field">
			<span class="wg__label">URL-адрес вашего сайта</span>
			<input class="wg__input" value="https://ulybka.ucoz.ru" disabled />
			<span class="wg__help"
				>Бесплатный адрес на поддомене uCoz. Свой домен подключается отдельно.</span
			>
		</label>

		<label class="wg__field">
			<span class="wg__label">Title</span>
			<input
				class="wg__input"
				class:is-active={field === 'title'}
				class:is-wrong={wrong && field === 'title'}
				disabled={field !== 'title'}
				bind:value={values.title}
				oninput={() => change('title')}
				placeholder={placeholder('title', 'Услуга и город')}
				maxlength="90"
			/>
			<span class="wg__counter">{values.title.length} / 70</span>
			<span class="wg__help">
				Синяя ссылка в Яндексе и Google. По ней поисковик и человек понимают, о чём сайт.
			</span>
		</label>

		<label class="wg__field">
			<span class="wg__label">Мета Description</span>
			<input
				class="wg__input"
				class:is-active={field === 'description'}
				class:is-wrong={wrong && field === 'description'}
				disabled={field !== 'description'}
				bind:value={values.description}
				oninput={() => change('description')}
				placeholder={placeholder('description', 'Одно-два предложения о сайте')}
				maxlength="200"
			/>
			<span class="wg__counter">{values.description.length} / 160</span>
			<span class="wg__help">
				Серый текст под ссылкой в поиске. Что делаете, для кого и где. Не влияет на позиции, но
				решает, кликнут ли.
			</span>
		</label>

		<div class="wg__bar">
			<span class="wg__muted">Дизайн: №2301 · Язык: русский · Время: Москва</span>
			<button
				type="button"
				class="wg__btn wg__btn--primary"
				onclick={() => onaction({ kind: 'click', value: 'save' })}>Сохранить</button
			>
		</div>
	</div>
</div>

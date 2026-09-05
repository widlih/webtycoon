<script lang="ts">
	import type { WidgetProps } from '..';

	let { onaction, wrong }: WidgetProps = $props();

	let subject = $state('');
	let preheader = $state('');
</script>

<div class="rs">
	<label class="rs__field">
		<span class="rs__label">Тема письма</span>
		<input
			class="rs__input"
			class:is-wrong={wrong}
			bind:value={subject}
			oninput={() => onaction({ kind: 'input', value: subject })}
			placeholder="Например: Ваш первый заказ со скидкой"
			maxlength="80"
		/>
		<span class="rs__counter">{subject.length} / 60</span>
	</label>
	<label class="rs__field">
		<span class="rs__label">Прехедер</span>
		<input
			class="rs__input"
			bind:value={preheader}
			placeholder="Короткий текст рядом с темой"
			maxlength="90"
		/>
	</label>
	<div class="rs__preview">
		<span class="rs__from">Кофейня «Зерно»</span>
		<span class="rs__subject">{subject || 'Тема письма'}</span>
		<span class="rs__pre">{preheader || 'Прехедер появится здесь'}</span>
	</div>
</div>

<style>
	.rs {
		display: grid;
		gap: 12px;
		font: 400 15px/140% var(--text-font);
		color: var(--ink);
		letter-spacing: -0.3px;
	}
	.rs__label {
		font: 400 14px/1 var(--text-font);
		color: var(--secondary);
	}

	.rs__field {
		display: grid;
		gap: 8px;
		position: relative;
	}
	.rs__input {
		border: 1px solid transparent;
		border-radius: 14px;
		padding: 12px 16px;
		font: 400 15px/1.3 var(--text-font);
		background: #fff;
		color: var(--ink);
		outline: none;
		transition: border-color 0.3s var(--quad);
	}
	.rs__input::placeholder {
		color: var(--muted);
	}
	.rs__input:focus {
		border-color: var(--ink);
	}
	.rs__input.is-wrong {
		border-color: #fd3456;
	}
	.rs__counter {
		position: absolute;
		right: 4px;
		top: 0;
		font-size: 12px;
		color: var(--muted);
	}
	.rs__preview {
		display: grid;
		gap: 2px;
		padding: 14px 16px;
		border-radius: 16px;
		background: #fff;
	}
	.rs__from {
		font-weight: 600;
	}
	.rs__subject {
		color: var(--ink);
	}
	.rs__pre {
		color: var(--muted);
		font-size: 13px;
	}
</style>

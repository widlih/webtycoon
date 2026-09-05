<script lang="ts">
	import type { WidgetProps } from '..';

	let { step, onaction, wrong }: WidgetProps = $props();

	const input = $derived(step.type === 'input' ? step : null);
	const title = $derived(input?.title ?? 'Рассылка · Тема и прехедер');
	const note = $derived(input?.note ?? 'Шаг 1 из 3 · Информация о письме');
	const placeholder = $derived(input?.placeholder ?? 'Например: Ваш первый заказ со скидкой');
	const max = $derived(input?.maxLength ?? 60);

	let subject = $state('');
	let preheader = $state('');
</script>

<div class="rs">
	<div class="rs__head">
		<span class="rs__title">{title}</span>
		<span class="rs__muted">{note}</span>
	</div>

	<div class="rs__panel">
		<label class="rs__field">
			<span class="rs__label">Тема письма</span>
			<input
				class="rs__input"
				class:is-wrong={wrong}
				bind:value={subject}
				oninput={() => onaction({ kind: 'input', value: subject })}
				{placeholder}
				maxlength="80"
			/>
			<span class="rs__counter" class:is-over={subject.length > max}>{subject.length} / {max}</span>
			<span class="rs__help">
				Тема решает, откроют письмо или пролистают. Коротко, по делу и без капса.
			</span>
		</label>

		<label class="rs__field">
			<span class="rs__label">
				Прехедер <span class="rs__optional">необязательно</span>
			</span>
			<input
				class="rs__input"
				bind:value={preheader}
				placeholder="Например: Скидка 20% на первый заказ до воскресенья"
				maxlength="90"
			/>
			<span class="rs__help">
				Серая строка, которую почта показывает сразу после темы. Прехедер не повторяет тему, а
				продолжает её и даёт ещё одну причину открыть письмо.
			</span>
		</label>
	</div>

	<div class="rs__inbox" aria-label="Предпросмотр во входящих">
		<span class="rs__inbox-title">Так письмо увидят во «Входящих»</span>
		<div class="rs__mail">
			<span class="rs__avatar">З</span>
			<span class="rs__mail-body">
				<span class="rs__from">Кофейня «Зерно»</span>
				<span class="rs__subject" class:is-empty={!subject}>{subject || 'Тема письма'}</span>
				<span class="rs__pre" class:is-empty={!preheader}
					>{preheader || 'Здесь появится прехедер'}</span
				>
			</span>
			<span class="rs__time">09:00</span>
		</div>
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
	.rs__head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 12px;
		flex-wrap: wrap;
	}
	.rs__title {
		font: 600 18px/1 var(--display);
		letter-spacing: -0.36px;
	}
	.rs__muted {
		color: var(--muted);
		font-size: 14px;
	}
	.rs__panel {
		display: grid;
		gap: 16px;
		padding: 16px;
		border-radius: 16px;
		background: #fff;
	}
	.rs__label {
		display: flex;
		align-items: baseline;
		gap: 8px;
		font: 500 14px/1 var(--text-font);
		color: var(--ink);
	}
	.rs__optional {
		font-weight: 400;
		font-size: 12px;
		color: var(--muted);
	}
	.rs__field {
		display: grid;
		gap: 8px;
		position: relative;
	}
	.rs__input {
		border: 1px solid #e5e4e7;
		border-radius: 14px;
		padding: 12px 16px;
		font: 400 15px/1.3 var(--text-font);
		background: var(--gray);
		color: var(--ink);
		outline: none;
		transition:
			border-color 0.3s var(--quad),
			background-color 0.3s var(--quad);
	}
	.rs__input::placeholder {
		color: var(--muted);
	}
	.rs__input:focus {
		border-color: var(--ink);
		background: #fff;
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
	.rs__counter.is-over {
		color: #fd3456;
	}
	.rs__help {
		color: var(--secondary);
		font-size: 13px;
		line-height: 140%;
		text-wrap: pretty;
	}

	.rs__inbox {
		display: grid;
		gap: 8px;
	}
	.rs__inbox-title {
		font: 400 13px/1 var(--text-font);
		color: var(--secondary);
		padding: 0 4px;
	}
	.rs__mail {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: 12px;
		align-items: start;
		padding: 12px 16px;
		border-radius: 16px;
		background: #fff;
	}
	.rs__avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: var(--violet);
		color: var(--ink);
		font: 700 15px/1 var(--display);
	}
	.rs__mail-body {
		display: grid;
		gap: 2px;
		min-width: 0;
	}
	.rs__from {
		font-weight: 600;
	}
	.rs__subject {
		color: var(--ink);
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.rs__pre {
		color: var(--secondary);
		font-size: 13px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.rs__subject.is-empty,
	.rs__pre.is-empty {
		color: var(--muted);
		font-weight: 400;
	}
	.rs__time {
		color: var(--muted);
		font-size: 12px;
		padding-top: 2px;
	}
</style>

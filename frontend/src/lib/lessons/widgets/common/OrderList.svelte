<script lang="ts">
	import {
		ChevronDown,
		ChevronUp,
		CircleDot,
		Clock,
		Filter,
		Flag,
		GitBranch,
		GripVertical,
		Hand,
		Heart,
		ListChecks,
		Mail,
		MessageSquare,
		Play
	} from '@lucide/svelte';
	import type { WidgetProps } from '..';

	let { step, onaction, wrong }: WidgetProps = $props();

	const order$ = $derived(step.type === 'order' ? step : null);
	const items = $derived(order$?.items ?? []);
	const details = $derived(order$?.details ?? []);
	const title = $derived(order$?.title ?? 'Схема');
	const note = $derived(
		order$?.note ?? 'Расставьте узлы сверху вниз: тяните за ручку или используйте стрелки'
	);

	/** Иконка по смыслу узла: тип угадывается по ключевым словам в названии */
	const icons: Array<[RegExp, typeof CircleDot]> = [
		[/старт|триггер|событие/i, Play],
		[/ожидан|задержк|пауза/i, Clock],
		[/активност|услов/i, GitBranch],
		[/письм/i, Mail],
		[/конец|финиш|благодарн/i, Heart],
		[/приветств/i, Hand],
		[/скрининг|отсе/i, Filter],
		[/открыт/i, MessageSquare],
		[/вопрос/i, ListChecks],
		[/заверш/i, Flag]
	];
	const iconFor = (text: string) => icons.find(([re]) => re.test(text))?.[1] ?? CircleDot;

	/** «Тип: описание» делится на заголовок и подзаголовок */
	const split = (text: string) => {
		const i = text.indexOf(':');
		return i > 0
			? { head: text.slice(0, i).trim(), tail: text.slice(i + 1).trim() }
			: { head: text, tail: '' };
	};

	let order = $state<number[]>([]);
	let touched = $state(false);

	$effect(() => {
		const n = items.length;
		order = items.map((_, i) => i).sort((a, b) => ((a * 7 + 3) % n) - ((b * 7 + 3) % n));
		touched = false;
	});

	function commit(next: number[]) {
		order = next;
		touched = true;
		onaction({ kind: 'order', value: order });
	}

	function move(from: number, to: number) {
		if (to < 0 || to >= order.length || from === to) return;
		const next = [...order];
		const [picked] = next.splice(from, 1);
		next.splice(to, 0, picked);
		commit(next);
	}

	// Перетаскивание за ручку
	let dragging = $state<number | null>(null);
	let dragY = $state(0);
	let overPos = $state<number | null>(null);
	let list = $state<HTMLOListElement | null>(null);

	function posAt(y: number): number | null {
		if (!list) return null;
		const rows = Array.from(list.querySelectorAll<HTMLElement>('[data-pos]'));
		for (const row of rows) {
			const r = row.getBoundingClientRect();
			if (y < r.top + r.height / 2) return Number(row.dataset.pos);
		}
		return rows.length - 1;
	}

	function begin(e: PointerEvent, pos: number) {
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		dragging = pos;
		overPos = pos;
		dragY = e.clientY;
	}
	function drag(e: PointerEvent) {
		if (dragging === null) return;
		dragY = e.clientY;
		overPos = posAt(e.clientY);
	}
	function drop() {
		if (dragging === null) return;
		if (overPos !== null) move(dragging, overPos);
		dragging = null;
		overPos = null;
	}
</script>

<div class="fl">
	<div class="fl__head">
		<span class="fl__title">{title}</span>
		<span class="fl__note">{note}</span>
	</div>

	<ol class="fl__list" bind:this={list} class:is-dragging={dragging !== null}>
		{#each order as idx, pos (idx)}
			{@const Icon = iconFor(items[idx])}
			{@const { head, tail } = split(items[idx])}
			<li
				class="fl__node"
				class:is-wrong={wrong && !touched}
				class:is-lifted={dragging === pos}
				class:is-target={dragging !== null && overPos === pos && dragging !== pos}
				data-pos={pos}
			>
				<span class="fl__rail" aria-hidden="true">
					<span class="fl__num">{pos + 1}</span>
					{#if pos < order.length - 1}<span class="fl__line"></span>{/if}
				</span>
				<div class="fl__card">
					<span class="fl__icon"><Icon size={18} strokeWidth={2.25} /></span>
					<span class="fl__body">
						<span class="fl__name">{head}</span>
						{#if tail}<span class="fl__tail">{tail}</span>{/if}
						{#if details[idx]}<span class="fl__detail">{details[idx]}</span>{/if}
					</span>
					<span class="fl__controls">
						<button
							class="fl__arrow"
							type="button"
							aria-label="Выше"
							disabled={pos === 0}
							onclick={() => move(pos, pos - 1)}><ChevronUp size={16} strokeWidth={2.5} /></button
						>
						<button
							class="fl__arrow"
							type="button"
							aria-label="Ниже"
							disabled={pos === order.length - 1}
							onclick={() => move(pos, pos + 1)}><ChevronDown size={16} strokeWidth={2.5} /></button
						>
						<span
							class="fl__grip"
							role="button"
							tabindex="-1"
							aria-label="Перетащить"
							onpointerdown={(e) => begin(e, pos)}
							onpointermove={drag}
							onpointerup={drop}
							onpointercancel={drop}><GripVertical size={18} strokeWidth={2} /></span
						>
					</span>
				</div>
			</li>
		{/each}
	</ol>

	{#if dragging !== null}
		{@const { head } = split(items[order[dragging]])}
		<div class="fl__ghost" style="top: {dragY}px">{head}</div>
	{/if}
</div>

<style>
	.fl {
		display: grid;
		gap: 14px;
		font: 400 15px/140% var(--text-font);
		color: var(--ink);
		letter-spacing: -0.3px;
	}
	.fl__head {
		display: grid;
		gap: 4px;
	}
	.fl__title {
		font: 600 18px/1 var(--display);
		letter-spacing: -0.36px;
	}
	.fl__note {
		color: var(--secondary);
		font-size: 14px;
	}

	.fl__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
	}
	.fl__list.is-dragging {
		user-select: none;
	}
	.fl__node {
		display: grid;
		grid-template-columns: 32px 1fr;
		gap: 10px;
		align-items: stretch;
		padding-bottom: 8px;
	}
	.fl__node:last-child {
		padding-bottom: 0;
	}
	.fl__rail {
		display: grid;
		grid-template-rows: auto 1fr;
		justify-items: center;
		gap: 4px;
	}
	.fl__num {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		margin-top: 12px;
		border-radius: 50%;
		background: var(--ink);
		color: #fff;
		font: 700 13px/1 var(--display);
		transition: background-color 0.2s var(--quad);
	}
	.fl__line {
		width: 2px;
		border-radius: 2px;
		background: #d7d7db;
		min-height: 12px;
	}
	.fl__card {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: 12px;
		align-items: center;
		padding: 12px 12px 12px 14px;
		border-radius: 16px;
		background: #fff;
		border: 2px solid transparent;
		transition:
			border-color 0.2s var(--quad),
			transform 0.3s var(--ease-overshoot-linear),
			box-shadow 0.2s var(--quad),
			opacity 0.2s var(--quad);
	}
	.fl__icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 38px;
		height: 38px;
		border-radius: 12px;
		background: var(--gray);
		color: var(--ink);
	}
	.fl__body {
		display: grid;
		gap: 2px;
		min-width: 0;
	}
	.fl__name {
		font: 600 15px/130% var(--display);
		letter-spacing: -0.3px;
	}
	.fl__tail {
		color: var(--ink);
		font-size: 14px;
	}
	.fl__detail {
		color: var(--secondary);
		font-size: 13px;
		line-height: 140%;
		margin-top: 2px;
		text-wrap: pretty;
	}
	.fl__controls {
		display: flex;
		align-items: center;
		gap: 4px;
	}
	.fl__arrow {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: 0;
		border-radius: 10px;
		background: var(--gray);
		color: var(--ink);
		cursor: pointer;
		transition:
			background-color 0.2s var(--quad),
			transform 0.3s var(--ease-overshoot-linear);
	}
	.fl__arrow:hover:not(:disabled) {
		background: #e5e4e7;
		transform: scale(1.06);
	}
	.fl__arrow:disabled {
		opacity: 0.3;
		cursor: default;
	}
	.fl__grip {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 32px;
		margin-left: 4px;
		border-radius: 10px;
		color: var(--muted);
		cursor: grab;
		touch-action: none;
	}
	.fl__grip:hover {
		color: var(--ink);
		background: var(--gray);
	}
	.fl__grip:active {
		cursor: grabbing;
	}

	.fl__node.is-wrong .fl__card {
		border-color: #fd3456;
	}
	.fl__node.is-lifted .fl__card {
		opacity: 0.35;
		transform: scale(0.98);
	}
	.fl__node.is-target .fl__card {
		border-color: var(--violet);
		background: #f2ecfd;
	}
	.fl__node.is-target .fl__num {
		background: var(--violet);
		color: var(--ink);
	}
	.fl__ghost {
		position: fixed;
		left: 50%;
		z-index: 70;
		transform: translate(-50%, -50%);
		padding: 10px 16px;
		border-radius: 14px;
		background: var(--ink);
		color: #fff;
		box-shadow: 0 12px 24px #0000002e;
		pointer-events: none;
		font: 600 13px/1 var(--display);
		white-space: nowrap;
	}

	@media (max-width: 640px) {
		.fl__node {
			grid-template-columns: 28px 1fr;
			gap: 8px;
		}
		.fl__card {
			grid-template-columns: auto 1fr;
			padding: 12px;
		}
		.fl__icon {
			width: 34px;
			height: 34px;
		}
		.fl__controls {
			grid-column: 1 / -1;
			justify-content: flex-end;
		}
	}
</style>

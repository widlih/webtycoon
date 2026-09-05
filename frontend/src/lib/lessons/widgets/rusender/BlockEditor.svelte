<script lang="ts">
	import { Image, MailX, MousePointerClick, Type } from '@lucide/svelte';
	import type { WidgetProps } from '..';

	let { onaction }: WidgetProps = $props();

	const blocks = [
		{ id: 'text', label: 'Текст', icon: Type },
		{ id: 'image', label: 'Картинка', icon: Image },
		{ id: 'button', label: 'Кнопка', icon: MousePointerClick },
		{ id: 'unsubscribe', label: 'Отписка', icon: MailX }
	];
	const zones = [
		{ id: 'header', label: 'Шапка письма' },
		{ id: 'afterText', label: 'После текста' },
		{ id: 'footer', label: 'Подвал письма' }
	];

	let dragging = $state<string | null>(null);
	let pos = $state({ x: 0, y: 0 });
	let over = $state<string | null>(null);
	let placed = $state<Record<string, string>>({});

	const labelOf = (id: string | undefined) => blocks.find((b) => b.id === id)?.label;

	function zoneAt(x: number, y: number): string | null {
		const el = document.elementFromPoint(x, y) as HTMLElement | null;
		return el?.closest<HTMLElement>('[data-zone]')?.dataset.zone ?? null;
	}

	function begin(e: PointerEvent, id: string) {
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		dragging = id;
		pos = { x: e.clientX, y: e.clientY };
	}
	function move(e: PointerEvent) {
		if (!dragging) return;
		pos = { x: e.clientX, y: e.clientY };
		over = zoneAt(e.clientX, e.clientY);
	}
	function end(e: PointerEvent) {
		if (!dragging) return;
		const zone = zoneAt(e.clientX, e.clientY);
		if (zone) {
			placed = { ...placed, [zone]: dragging };
			onaction({ kind: 'drop', value: dragging === 'button' ? zone : `${dragging}:${zone}` });
		}
		dragging = null;
		over = null;
	}
</script>

<div class="rs">
	<div class="rs__side">
		<span class="rs__side-title">Блоки · тяните в письмо</span>
		{#each blocks as b (b.id)}
			<div
				class="rs__block"
				role="button"
				tabindex="0"
				aria-label="Блок «{b.label}», перетащите в письмо"
				onpointerdown={(e) => begin(e, b.id)}
				onpointermove={move}
				onpointerup={end}
				onpointercancel={() => (dragging = null)}
			>
				<b.icon size={16} strokeWidth={2.25} />
				{b.label}
			</div>
		{/each}
	</div>
	<div class="rs__letter">
		<div class="rs__zone" data-zone="header" class:is-over={over === 'header'}>
			{#if placed.header === 'image'}
				<span class="rs__hero"><Image size={18} strokeWidth={2} /> Фото кофейни</span>
			{:else}
				{labelOf(placed.header) ?? zones[0].label}
			{/if}
		</div>
		<p class="rs__text">
			Привет! Спасибо, что подписались на новости кофейни «Зерно». Раз в неделю будем присылать
			новинки меню и скидки для своих.
		</p>
		<div class="rs__zone" data-zone="afterText" class:is-over={over === 'afterText'}>
			{#if placed.afterText === 'button'}
				<span class="rs__cta">Забрать подарок</span>
			{:else}
				{labelOf(placed.afterText) ?? zones[1].label}
			{/if}
		</div>
		<div class="rs__zone rs__zone--small" data-zone="footer" class:is-over={over === 'footer'}>
			{#if placed.footer === 'unsubscribe'}
				<span class="rs__unsub">Отписаться от рассылки</span>
			{:else}
				{labelOf(placed.footer) ?? zones[2].label}
			{/if}
		</div>
	</div>
</div>
{#if dragging}
	<div class="rs__ghost" style="left: {pos.x}px; top: {pos.y}px">{labelOf(dragging)}</div>
{/if}

<style>
	.rs {
		display: grid;
		gap: 12px;
		font: 400 15px/140% var(--text-font);
		color: var(--ink);
		letter-spacing: -0.3px;
	}

	.rs {
		grid-template-columns: 150px 1fr;
	}
	.rs__side {
		display: grid;
		gap: 8px;
		align-content: start;
	}
	.rs__side-title {
		font: 400 13px/1 var(--text-font);
		color: var(--secondary);
		padding: 0 4px;
	}
	.rs__block {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 14px;
		border-radius: 14px;
		background: #fff;
		cursor: grab;
		touch-action: none;
		user-select: none;
		font-weight: 600;
		font-size: 14px;
	}
	.rs__block:active {
		cursor: grabbing;
	}
	.rs__letter {
		display: grid;
		gap: 8px;
		padding: 14px;
		border-radius: 16px;
		background: #fff;
	}
	.rs__text {
		margin: 0;
		padding: 8px 4px;
		color: var(--secondary);
		font-size: 14px;
	}
	.rs__zone {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 48px;
		border: 2px dashed #c3c3c6;
		border-radius: 12px;
		color: var(--muted);
		font-size: 13px;
		transition:
			border-color 0.2s var(--quad),
			background-color 0.2s var(--quad);
	}
	.rs__zone--small {
		min-height: 36px;
	}
	.rs__zone.is-over {
		border-color: var(--violet);
		color: var(--ink);
		background: #f2ecfd;
	}
	.rs__hero {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		color: var(--secondary);
	}
	.rs__cta {
		padding: 8px 18px;
		border-radius: 20px;
		background: var(--ink);
		color: #fff;
		font: 600 14px/1 var(--display);
	}
	.rs__unsub {
		color: var(--secondary);
		font-size: 12px;
		text-decoration: underline;
	}
	.rs__ghost {
		position: fixed;
		z-index: 70;
		transform: translate(-50%, -120%);
		padding: 10px 14px;
		border-radius: 14px;
		background: var(--ink);
		color: #fff;
		box-shadow: 0 10px 20px #0000001f;
		pointer-events: none;
		font: 600 13px/1 var(--display);
	}
	@media (max-width: 640px) {
		.rs {
			grid-template-columns: 1fr;
		}
		.rs__side {
			grid-template-columns: repeat(4, 1fr);
		}
		.rs__side-title {
			grid-column: 1 / -1;
		}
		.rs__block {
			padding: 10px 8px;
			font-size: 13px;
			justify-content: center;
		}
	}
</style>

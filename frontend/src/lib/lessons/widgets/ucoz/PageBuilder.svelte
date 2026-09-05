<script lang="ts">
	import { Heading, Image, Map, MousePointerClick, Send, Type } from '@lucide/svelte';
	import type { WidgetProps } from '..';

	let { onaction }: WidgetProps = $props();

	const blocks = [
		{ id: 'heading', label: 'Заголовок', icon: Heading },
		{ id: 'text', label: 'Текст', icon: Type },
		{ id: 'form', label: 'Форма заявки', icon: Send },
		{ id: 'gallery', label: 'Галерея', icon: Image },
		{ id: 'button', label: 'Кнопка', icon: MousePointerClick },
		{ id: 'map', label: 'Карта', icon: Map }
	];
	const zones = [
		{ id: 'hero', label: 'Первый экран', tall: true },
		{ id: 'content', label: 'Основной блок', tall: true },
		{ id: 'footer', label: 'Подвал', tall: false }
	];

	let dragging = $state<string | null>(null);
	let pos = $state({ x: 0, y: 0 });
	let over = $state<string | null>(null);
	let placed = $state<Record<string, string>>({});

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
			onaction({ kind: 'drop', value: `${dragging}:${zone}` });
		}
		dragging = null;
		over = null;
	}
	const label = (id: string | undefined) => blocks.find((b) => b.id === id)?.label;
</script>

<div class="wg">
	<span class="wg__title">Редактор страниц · Главная</span>
	<div class="wg__split">
		<div class="wg__side">
			{#each blocks as b (b.id)}
				<div
					class="wg__block"
					role="button"
					tabindex="0"
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
		<div class="wg__canvas">
			{#each zones as z (z.id)}
				<div
					class="wg__zone"
					class:wg__zone--tall={z.tall}
					class:is-over={over === z.id}
					class:is-filled={Boolean(placed[z.id])}
					data-zone={z.id}
				>
					{label(placed[z.id]) ?? z.label}
				</div>
			{/each}
		</div>
	</div>
</div>

{#if dragging}
	<div class="wg__ghost" style="left: {pos.x}px; top: {pos.y}px">{label(dragging)}</div>
{/if}

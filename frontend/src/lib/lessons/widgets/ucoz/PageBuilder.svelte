<script lang="ts">
	import {
		FileText,
		Heading,
		Home,
		Image,
		Link,
		Map,
		MousePointerClick,
		Send,
		Type
	} from '@lucide/svelte';
	import Choices from '../common/Choices.svelte';
	import type { WidgetProps } from '..';

	let { step, onaction }: WidgetProps = $props();

	const blocks = [
		{ id: 'heading', label: 'Заголовок', icon: Heading },
		{ id: 'text', label: 'Текст', icon: Type },
		{ id: 'form', label: 'Форма заявки', icon: Send },
		{ id: 'gallery', label: 'Галерея', icon: Image },
		{ id: 'button', label: 'Кнопка', icon: MousePointerClick },
		{ id: 'map', label: 'Карта', icon: Map }
	];
	const zones = [
		{ id: 'hero', label: 'Первый экран · видно без прокрутки', tall: true },
		{ id: 'content', label: 'Основной блок', tall: true },
		{ id: 'footer', label: 'Подвал · контакты', tall: false }
	];

	const choose = $derived(step.type === 'choose' ? step : null);
	const title = $derived(
		(step.type === 'drag' ? undefined : choose?.title) ?? 'Редактор страниц · Запись на приём'
	);
	const note = $derived(
		choose?.note ??
			'Блоки слева тяните в пунктирные зоны страницы. Зона подсветится, когда вы над ней'
	);

	const icons: Array<[RegExp, typeof Link]> = [
		[/форм|запис|якор/i, Send],
		[/главн/i, Home],
		[/о клинике|о компании|страниц/i, FileText]
	];
	const iconFor = (text: string) => icons.find(([re]) => re.test(text))?.[1] ?? Link;

	let dragging = $state<string | null>(null);
	let pos = $state({ x: 0, y: 0 });
	let over = $state<string | null>(null);
	let placed = $state<Record<string, string>>({});
	// В режиме выбора страница уже собрана из прошлых шагов
	const shown = $derived<Record<string, string>>(
		choose ? { hero: 'heading', content: 'form', footer: 'map', ...placed } : placed
	);

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
	<div class="wg__head">
		<span class="wg__title">{title}</span>
		<span class="wg__note">{note}</span>
	</div>
	<div class="wg__split">
		{#if !choose}
			<div class="wg__side">
				<span class="wg__label">Блоки · тяните на страницу</span>
				{#each blocks as b (b.id)}
					<div
						class="wg__block"
						role="button"
						tabindex="0"
						aria-label="Блок «{b.label}», перетащите на страницу"
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
		{/if}
		<div class="wg__canvas">
			{#each zones as z (z.id)}
				<div
					class="wg__zone"
					class:wg__zone--tall={z.tall}
					class:is-over={over === z.id}
					class:is-filled={Boolean(shown[z.id])}
					data-zone={z.id}
				>
					{label(shown[z.id]) ?? z.label}
					{#if choose && z.id === 'hero'}
						<span class="wg__canvas-cta">Записаться</span>
					{/if}
				</div>
			{/each}
		</div>
	</div>
	{#if choose}
		<Choices
			options={choose.options}
			meta={choose.meta ?? []}
			icon={iconFor}
			onpick={(i) => onaction({ kind: 'choose', value: i })}
		/>
	{/if}
</div>
{#if dragging}
	<div class="wg__ghost" style="left: {pos.x}px; top: {pos.y}px">{label(dragging)}</div>
{/if}

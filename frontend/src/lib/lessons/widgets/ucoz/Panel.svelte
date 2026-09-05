<script lang="ts">
	import {
		BookOpen,
		Camera,
		FileText,
		FolderOpen,
		Gamepad2,
		HelpCircle,
		ListChecks,
		Mail,
		MessageSquare,
		Newspaper,
		Puzzle,
		ShoppingCart,
		Smartphone,
		Store,
		Users,
		Vote
	} from '@lucide/svelte';
	import Choices from '../common/Choices.svelte';
	import type { WidgetProps } from '..';

	let { step, onaction }: WidgetProps = $props();

	const menu = [
		{ id: 'settings', label: 'Настройки' },
		{ id: 'design', label: 'Дизайн' },
		{ id: 'tools', label: 'Инструменты' },
		{ id: 'security', label: 'Безопасность' },
		{ id: 'help', label: 'Помощь' },
		{ id: 'paid', label: 'Платные услуги' }
	];
	const active = [
		{ id: 'news', label: 'Новости сайта', icon: Newspaper, about: 'лента публикаций' },
		{ id: 'pages', label: 'Редактор страниц', icon: FileText, about: 'обычные страницы' },
		{ id: 'users', label: 'Пользователи', icon: Users, about: 'регистрация и роли' }
	];
	const inactive = [
		{ id: 'mailform', label: 'Почтовые формы', icon: Mail, about: 'заявки с сайта на почту' },
		{ id: 'guestbook', label: 'Гостевая книга', icon: Store, about: 'отзывы посетителей' },
		{ id: 'photo', label: 'Фотоальбомы', icon: Camera, about: 'галереи фотографий' },
		{ id: 'blog', label: 'Блог', icon: BookOpen, about: 'статьи с комментариями' },
		{ id: 'forum', label: 'Форум', icon: MessageSquare, about: 'обсуждения' },
		{ id: 'poll', label: 'Опросы', icon: Vote, about: 'голосования на сайте' },
		{ id: 'faq', label: 'FAQ', icon: HelpCircle, about: 'вопросы и ответы' },
		{ id: 'shop', label: 'Интернет-магазин', icon: ShoppingCart, about: 'товары и корзина' }
	];

	const choose = $derived(step.type === 'choose' ? step : null);
	const title = $derived(
		choose?.title ?? (step.type === 'click' ? 'Панель управления' : 'Модули сайта')
	);
	const note = $derived(
		choose?.note ??
			(step.type === 'click'
				? 'Верхнее меню: разделы панели. Ниже: модули, каждый добавляет сайту одну функцию'
				: '')
	);

	const icons: Array<[RegExp, typeof Newspaper]> = [
		[/новост/i, Newspaper],
		[/фото|галере/i, Camera],
		[/форум/i, MessageSquare],
		[/файл/i, FolderOpen],
		[/игр/i, Gamepad2],
		[/тест|чек-?лист/i, ListChecks],
		[/форм|заявк/i, Mail],
		[/гостев|отзыв/i, Store],
		[/стать|блог/i, BookOpen],
		[/магазин/i, ShoppingCart],
		[/телефон|мобил/i, Smartphone],
		[/мета|url|seo|тег/i, Puzzle]
	];
	const iconFor = (text: string) => icons.find(([re]) => re.test(text))?.[1] ?? Puzzle;

	let on = $state<Record<string, boolean>>({});
	let section = $state<string | null>(null);
</script>

<div class="wg">
	<div class="wg__menu" aria-label="Разделы панели управления">
		{#each menu as item (item.id)}
			<button
				type="button"
				class="wg__menu-item"
				class:is-active={section === item.id}
				onclick={() => {
					section = item.id;
					onaction({ kind: 'click', value: item.id });
				}}>{item.label}</button
			>
		{/each}
	</div>

	<div class="wg__panel">
		<div class="wg__bar">
			<div>
				<span class="wg__name">Стоматология «Улыбка»</span>
				<div class="wg__muted">ulybka.ucoz.ru · диск 12 МБ из 400 · тариф Бесплатный</div>
			</div>
			<div class="wg__actions">
				<button
					type="button"
					class="wg__btn wg__btn--soft"
					onclick={() => onaction({ kind: 'click', value: 'domains' })}>Домены и SSL</button
				>
				<button
					type="button"
					class="wg__btn wg__btn--soft"
					onclick={() => onaction({ kind: 'click', value: 'files' })}>Файлы</button
				>
			</div>
		</div>
	</div>

	<div class="wg__head">
		<span class="wg__title">{title}</span>
		{#if note}<span class="wg__note">{note}</span>{/if}
	</div>

	{#if choose}
		<Choices
			options={choose.options}
			meta={choose.meta ?? []}
			icon={iconFor}
			onpick={(i) => onaction({ kind: 'choose', value: i })}
		/>
	{:else}
		<span class="wg__label">Активные</span>
		<div class="wg__grid">
			{#each active as m (m.id)}
				<button
					type="button"
					class="wg__card"
					onclick={() => onaction({ kind: 'click', value: `module:${m.id}` })}
				>
					<span class="wg__icon"><m.icon size={16} strokeWidth={2.25} /></span>
					<span class="wg__name">{m.label}</span>
					<span class="wg__muted">{m.about}</span>
					<span class="wg__tag wg__tag--on">Включён</span>
				</button>
			{/each}
		</div>
		<span class="wg__label">Неактивные · нажмите, чтобы включить</span>
		<div class="wg__grid">
			{#each inactive as m (m.id)}
				<button
					type="button"
					class="wg__card"
					class:is-picked={on[m.id]}
					onclick={() => {
						on = { ...on, [m.id]: true };
						onaction({ kind: 'click', value: `module:${m.id}` });
					}}
				>
					<span class="wg__icon"><m.icon size={16} strokeWidth={2.25} /></span>
					<span class="wg__name">{m.label}</span>
					<span class="wg__muted">{m.about}</span>
					<span class="wg__tag" class:wg__tag--on={on[m.id]}
						>{on[m.id] ? 'Включён' : 'Активировать'}</span
					>
				</button>
			{/each}
		</div>
	{/if}
</div>

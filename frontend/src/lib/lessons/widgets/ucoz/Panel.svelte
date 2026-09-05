<script lang="ts">
	import {
		BookOpen,
		Camera,
		FileText,
		HelpCircle,
		Image,
		Mail,
		MessageSquare,
		Newspaper,
		ShoppingCart,
		Store,
		Users,
		Vote
	} from '@lucide/svelte';
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
		{ id: 'news', label: 'Новости сайта', icon: Newspaper },
		{ id: 'pages', label: 'Редактор страниц', icon: FileText },
		{ id: 'users', label: 'Пользователи', icon: Users }
	];
	const inactive = [
		{ id: 'shop', label: 'Интернет-магазин', icon: ShoppingCart },
		{ id: 'blog', label: 'Блог', icon: BookOpen },
		{ id: 'forum', label: 'Форум', icon: MessageSquare },
		{ id: 'guestbook', label: 'Гостевая книга', icon: Store },
		{ id: 'poll', label: 'Опросы', icon: Vote },
		{ id: 'photo', label: 'Фотоальбомы', icon: Camera },
		{ id: 'faq', label: 'FAQ', icon: HelpCircle },
		{ id: 'mailform', label: 'Почтовые формы', icon: Mail }
	];
	const options = $derived(step.type === 'choose' ? step.options : []);
	let picked = $state<number | null>(null);
	let on = $state<Record<string, boolean>>({});
</script>

<div class="wg">
	<div class="wg__menu">
		{#each menu as item (item.id)}
			<button class="wg__menu-item" onclick={() => onaction({ kind: 'click', value: item.id })}
				>{item.label}</button
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
					class="wg__btn wg__btn--soft"
					onclick={() => onaction({ kind: 'click', value: 'domains' })}>Домены и SSL</button
				>
				<button
					class="wg__btn wg__btn--soft"
					onclick={() => onaction({ kind: 'click', value: 'files' })}>Файлы</button
				>
			</div>
		</div>
	</div>
	{#if step.type === 'choose'}
		<span class="wg__label">Список модулей</span>
		<div class="wg__grid">
			{#each options as option, i (option)}
				<button
					class="wg__card"
					class:is-picked={picked === i}
					onclick={() => {
						picked = i;
						onaction({ kind: 'choose', value: i });
					}}
				>
					<span class="wg__icon"><Image size={16} strokeWidth={2.25} /></span>
					<span class="wg__name">{option}</span>
				</button>
			{/each}
		</div>
	{:else}
		<span class="wg__label">Список модулей · Активные</span>
		<div class="wg__grid">
			{#each active as m (m.id)}
				<button
					class="wg__card"
					onclick={() => onaction({ kind: 'click', value: `module:${m.id}` })}
				>
					<span class="wg__icon"><m.icon size={16} strokeWidth={2.25} /></span>
					<span class="wg__name">{m.label}</span>
					<span class="wg__tag wg__tag--on">Включён</span>
				</button>
			{/each}
		</div>
		<span class="wg__label">Неактивные</span>
		<div class="wg__grid">
			{#each inactive as m (m.id)}
				<button
					class="wg__card"
					class:is-picked={on[m.id]}
					onclick={() => {
						on = { ...on, [m.id]: true };
						onaction({ kind: 'click', value: `module:${m.id}` });
					}}
				>
					<span class="wg__icon"><m.icon size={16} strokeWidth={2.25} /></span>
					<span class="wg__name">{m.label}</span>
					<span class="wg__tag">{on[m.id] ? 'Включён' : 'Активировать'}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>

<script lang="ts">
	import { resolve } from '$app/paths';
	import Header from '$lib/landing/Header.svelte';
	import Footer from '$lib/landing/Footer.svelte';
	import Button from '$lib/landing/Button.svelte';
	import SectionHeader from '$lib/landing/SectionHeader.svelte';
	import ScrollAppearText from '$lib/landing/ScrollAppearText.svelte';
	import StackCards from '$lib/landing/StackCards.svelte';
	import FeatureCards from '$lib/landing/FeatureCards.svelte';

	const links = [
		{ label: 'Студия', href: '#studio' },
		{ label: 'Обучение', href: '#learn' },
		{ label: 'Задания', href: '#quests' },
		{ label: 'Купоны', href: '#coupons' }
	];
</script>

<svelte:head>
	<title>WebTycoon — игра о веб-студии</title>
	<meta
		name="description"
		content="Онлайн-игра о веб-студии: собирай команду, выполняй заказы и учись работать в RuSender, uCoz и WebAsk. Задания, рейтинг и настоящие скидки."
	/>
</svelte:head>

<div class="lp">
	<Header {links} />

	<main id="main-content">
		<section class="lp-hero">
			<div class="lp-hero__wrap">
				<SectionHeader level="h1" tag="Игра о веб-студии" title="Построй свою веб-студию">
					{#snippet button()}
						<Button href={resolve('/login')} color="violet" size="medium">Начать играть</Button>
					{/snippet}
				</SectionHeader>
			</div>
			<div class="lp-container">
				<p class="lp-hero__text">
					<b>WebTycoon — онлайн-игра про веб-бизнес.</b> Собирай команду, выполняй заказы клиентов и учись
					работать в сервисах для рассылок, сайтов и опросов.
				</p>
			</div>
		</section>

		<section class="lp-section lp-features" id="studio">
			<SectionHeader
				tag="Студия"
				title="Студия становится лучше"
				text="<strong>Каждый заказ приносит монеты.</strong> Монеты превращаются в новые комнаты, сотрудников и мебель."
			/>
			<FeatureCards
				cards={[
					{
						big: 'Заказы',
						art: '/img/people/executive-businesswoman-pointing-down.webp',
						title: 'Клиенты приходят сами',
						text: 'Выбирай заказ из ленты и отдавай сотруднику. Он сделает работу, ты получишь монеты и опыт.'
					},
					{
						big: 'Команда',
						art: '/img/people/office-woman-employee-standing-proudly.webp',
						title: 'Сильнее с каждым наймом',
						text: 'Нанимай сотрудников, обустраивай комнаты и открывай новые. Чем больше команда, тем больше заказов студия закрывает одновременно.'
					}
				]}
			/>
		</section>

		<ScrollAppearText
			text="Здесь не читают про рассылки — их отправляют. Не смотрят на сайты — их собирают. RuSender, uCoz, WebAsk: в каждом уроке твои руки на настоящем интерфейсе. Прошёл — и вся студия стала чуть умнее."
		/>

		<section class="lp-section lp-stack" id="learn">
			<div class="lp-container">
				<SectionHeader
					class="lp-stack__header"
					tag="Обучение"
					title="Учишься ты —<br />ускоряется студия"
					text="<strong>Уроки построены на реальных сервисах:</strong> RuSender, uCoz и WebAsk."
				/>
				<StackCards
					cards={[
						{
							color: 'gray',
							label: '+1 навык',
							title: 'Уроки в интерфейсе сервиса',
							text: 'Каждый шаг — действие в интерфейсе, который повторяет настоящий: собрать письмо, настроить сайт, запустить опрос. Пройденный урок повышает навык студии: заказы выполняются быстрее и приносят больше.'
						},
						{
							color: 'blue',
							label: '×1,25',
							title: 'Помоги сотруднику',
							text: 'Не хочешь ждать таймер — ответь на три вопроса или пройди мини-игру. Заказ закроется сразу, а награда вырастет на четверть.'
						},
						{
							color: 'violet',
							label: 'XP',
							title: 'Рейтинг',
							text: 'Опыт за уроки и заказы попадает в рейтинг дня, недели и месяца. Первые три места получают монеты и боксы с призами.'
						}
					]}
				/>
			</div>
		</section>

		<section class="lp-section lp-features" id="quests">
			<SectionHeader
				tag="Задания и купоны"
				title="Играешь бесплатно.<br />Скидки настоящие."
				text="<strong>Задания приносят монеты и опыт,</strong> а премиум меняется на скидки в реальных сервисах <img class='lp-emoji' src='/img/landing/silent.webp' alt='' />"
			/>
			<span id="coupons"></span>
			<FeatureCards
				cards={[
					{
						big: 'Задания',
						art: '/img/box/coins.webp',
						artAlign: 'center',
						title: 'Каждый день новые',
						text: 'Закрыть три заказа, пройти урок, изучить сервис партнёра, позвать друга. Выполнил задание — забрал награду.'
					},
					{
						big: 'Купоны',
						art: [
							'/img/coupons/rusender.webp',
							'/img/coupons/ucoz.webp',
							'/img/coupons/webask.webp'
						],
						artLayout: 'fan',
						title: 'Выход в реальный мир',
						text: 'Премиум меняется на скидку до 25% в RuSender, uCoz и WebAsk.'
					}
				]}
			/>
		</section>
	</main>

	<Footer
		title="Создай свою студию"
		text="Играй бесплатно, расти по-настоящему"
		cta="Начать играть"
		columns={[
			{ title: 'Игра', links },
			{
				title: 'Документы',
				links: [
					{ label: 'Правила', href: resolve('/rules') },
					{ label: 'Политика обработки данных', href: resolve('/privacy') }
				]
			}
		]}
	/>
</div>

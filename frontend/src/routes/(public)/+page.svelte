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
		{ label: 'Обучение', href: '#learn' },
		{ label: 'Задания', href: '#quests' },
		{ label: 'Купоны', href: '#coupons' }
	];
</script>

<svelte:head>
	<title>WebTycoon — игра о веб-студии</title>
	<meta
		name="description"
		content="Браузерная игра-тайкун: уроки по реальным сервисам, задания за реальные действия и купоны на скидки."
	/>
</svelte:head>

<div class="lp">
	<Header {links} />

	<main id="main-content">
		<section class="lp-hero">
			<div class="lp-hero__wrap">
				<SectionHeader
					level="h1"
					tag="Игра о веб-студии"
					title="Строй студию.<br />Осваивай продукты."
				>
					{#snippet button()}
						<Button href={resolve('/login')} color="violet" size="medium">Начать бесплатно</Button>
					{/snippet}
				</SectionHeader>
			</div>
			<div class="lp-container">
				<p class="lp-hero__text">
					<b>WebTycoon — браузерная игра-тайкун.</b> Проходишь уроки по реальным сервисам, прокачиваешь
					отделы и получаешь купоны на скидки.
				</p>
			</div>
		</section>

		<ScrollAppearText
			text="Ядро игры — интерактивное обучение. Уроки по рассылкам в RuSender, сайтам в uCoz и опросам в WebAsk: клик, выбор, перетаскивание, ввод. Прошёл урок — прокачал отдел."
		/>

		<section class="lp-section lp-stack" id="learn">
			<div class="lp-container">
				<SectionHeader
					class="lp-stack__header"
					tag="Обучение"
					title="От урока к прокачке"
					text="<strong>Сотрудник выполняет заказ по таймеру.</strong> Урок или квиз закрывает заказ сразу."
				/>
				<StackCards
					cards={[
						{
							color: 'gray',
							label: '+1 навык',
							title: 'Уроки по шагам',
							text: 'Каждый урок состоит из нескольких шагов с обязательным действием: клик, выбор, перетаскивание, ввод. За прохождение отдел получает уровень.'
						},
						{
							color: 'blue',
							label: '×1,25',
							title: 'Квизы вместо ожидания',
							text: 'Ответь на вопросы по материалу и закрой заказ без таймера. Пройденный квиз даёт бонус к награде ×1,25.'
						},
						{
							color: 'violet',
							label: 'XP',
							title: 'Рейтинг дня',
							text: 'Опыт за уроки и заказы идёт в рейтинг дня. В конце дня лучшие игроки получают призы.'
						}
					]}
				/>
			</div>
		</section>

		<section class="lp-section lp-features" id="quests">
			<SectionHeader
				tag="Задания и купоны"
				title="Реальные действия —<br />игровые награды"
				text="<strong>Награда выдаётся за действие вне игры:</strong> регистрацию, подписку или действие в продукте."
			/>
			<span id="coupons"></span>
			<FeatureCards
				cards={[
					{
						big: 'Задания',
						title: 'Награда за реальные действия',
						text: 'Подпишись на канал, зарегистрируйся в сервисе или выполни действие внутри продукта — и получи внутриигровую валюту.'
					},
					{
						big: 'Купоны',
						title: 'Скидки на продукты',
						text: 'Меняй внутриигровую валюту на купоны со скидкой на конструктор сайтов, сервис рассылок, формы, домены и разработку.'
					}
				]}
			/>
		</section>
	</main>

	<Footer
		title="Начни строить студию"
		text="Регистрация бесплатная. Играть можно в браузере."
		cta="Начать бесплатно"
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

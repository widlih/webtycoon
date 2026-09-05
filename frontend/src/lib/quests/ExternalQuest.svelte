<script lang="ts">
	import { onMount } from 'svelte';
	import { Check, Copy, ExternalLink, X } from '@lucide/svelte';
	import { useConvexClient, useMutation } from 'convex-svelte';
	import Button from '$lib/landing/Button.svelte';
	import Price from '$lib/landing/Price.svelte';
	import Burst from '$lib/fx/Burst.svelte';
	import { centerOf, flyReward } from '$lib/fx/fly';
	import { authClient } from '$lib/auth';
	import { api } from '../../convex/_generated/api';

	type Quest = {
		slug: string;
		title: string;
		reward: { coins: number; xp: number };
		completed: boolean;
		startedAt: number | null;
		action: string | null;
		url: string | null;
		frame: boolean;
		seconds: number;
		slides: Array<{ title: string; text: string }>;
		channel: string | null;
		progress: number;
		target: number;
	};

	let {
		quest,
		telegramBot,
		onclose
	}: { quest: Quest; telegramBot: string | null; onclose: () => void } = $props();

	const client = useConvexClient();
	const start = useMutation(api.quests.start);
	const finish = useMutation(api.quests.finish);
	const claim = useMutation(api.quests.claim);
	const subscribe = useMutation(api.quests.subscribe);
	const referral = useMutation(api.quests.referral);

	// svelte-ignore state_referenced_locally
	let left = $state(quest.seconds);
	let running = $state(false);
	// svelte-ignore state_referenced_locally
	let done = $state(quest.completed);
	let claimed = $state(false);
	let busy = $state(false);
	let error = $state('');
	let email = $state('');
	let code = $state('');
	let copied = $state(false);
	let slide = $state(0);
	let box = $state<HTMLDivElement | null>(null);
	function celebrate() {
		claimed = true;
		flyReward(centerOf(box), quest.reward);
	}
	let tgStatus = $state<'idle' | 'not_linked' | 'not_member' | 'ok' | 'not_configured'>('idle');

	const timed = $derived(quest.action === 'visit' || quest.action === 'watch');
	const origin = $derived(typeof location !== 'undefined' ? location.origin : '');
	const inviteLink = $derived(code ? `${origin}/?ref=${code}` : '');
	const botLink = $derived(telegramBot && code ? `https://t.me/${telegramBot}?start=${code}` : '');

	let timer: ReturnType<typeof setInterval> | null = null;

	function tick() {
		left = Math.max(0, left - 1);
		if (quest.action === 'watch' && quest.slides.length > 0) {
			const per = quest.seconds / quest.slides.length;
			slide = Math.min(quest.slides.length - 1, Math.floor((quest.seconds - left) / per));
		}
		if (left === 0 && timer) {
			clearInterval(timer);
			timer = null;
			running = false;
		}
	}

	async function begin() {
		if (done || running) return;
		error = '';
		try {
			await start({ slug: quest.slug });
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
			return;
		}
		left = quest.seconds;
		running = true;
		timer = setInterval(tick, 1000);
	}

	async function collect() {
		busy = true;
		error = '';
		try {
			if (!done) {
				await finish({ slug: quest.slug });
				done = true;
			}
			await claim({ slug: quest.slug });
			celebrate();
		} catch (e) {
			const m = e instanceof Error ? e.message : String(e);
			error = m.includes('TOO_EARLY') ? 'Подождите, таймер ещё идёт' : m;
		} finally {
			busy = false;
		}
	}

	async function claimOnly() {
		busy = true;
		error = '';
		try {
			await claim({ slug: quest.slug });
			celebrate();
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			busy = false;
		}
	}

	async function sendEmail() {
		busy = true;
		error = '';
		try {
			await subscribe({ email });
			await claim({ slug: quest.slug });
			celebrate();
		} catch (e) {
			const m = e instanceof Error ? e.message : String(e);
			error = m.includes('INVALID_EMAIL') ? 'Проверьте email' : m;
		} finally {
			busy = false;
		}
	}

	async function copy() {
		await navigator.clipboard.writeText(inviteLink);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	async function checkTelegram() {
		busy = true;
		error = '';
		try {
			tgStatus = await client.action(api.telegram.check, { slug: quest.slug });
			if (tgStatus === 'ok') {
				done = true;
				await claim({ slug: quest.slug });
				celebrate();
			}
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			busy = false;
		}
	}

	onMount(() => {
		if (quest.action === 'invite' || quest.action === 'telegram') referral({}).then((c) => (code = c));
		if (quest.action === 'newsletter')
			authClient.getSession().then((s) => {
				email = s.data?.user.email ?? '';
			});
		if (quest.action === 'visit' && quest.frame && !done) begin();
		if (quest.action === 'watch' && !done) begin();
		return () => {
			if (timer) clearInterval(timer);
		};
	});
</script>

<div class="app-modal" role="dialog" aria-modal="true">
	<div
		bind:this={box}
		class="app-modal__box"
		class:app-modal__box--wide={quest.action === 'visit' && quest.frame}
	>
		<div class="app-panel__head">
			<div>
				<h2 class="app-panel__title">{quest.title}</h2>
				<p class="app-panel__sub">
					Награда <Price value={quest.reward.coins} prefix="+" />
					<Price value={quest.reward.xp} kind="xp" prefix="+" />
				</p>
			</div>
			<button class="app-panel__close" aria-label="Закрыть" onclick={onclose}
				><X size={20} strokeWidth={2.25} /></button
			>
		</div>

		{#if claimed}
			<div class="xq-done">
				<Burst />
				<Check size={28} strokeWidth={2.5} />
				<p class="quiz__verdict">Награда получена</p>
				<p class="quiz__reward">
					<Price value={quest.reward.coins} prefix="+" />
					<Price value={quest.reward.xp} kind="xp" prefix="+" />
				</p>
			</div>
			<div class="app-panel__action"><Button color="black" size="medium" onclick={onclose}>Готово</Button></div>
		{:else if quest.action === 'visit' && quest.frame}
			<div class="xq-bar">
				<span class="xq-timer" class:is-ready={left === 0 || done}>
					{#if done || left === 0}Можно забирать награду{:else}Осталось {left} с{/if}
				</span>
				<a class="app-link" href={quest.url ?? '#'} target="_blank" rel="noopener">
					Открыть в новой вкладке <ExternalLink size={14} strokeWidth={2.25} />
				</a>
			</div>
			<iframe class="xq-frame" src={quest.url} title={quest.title} loading="lazy"></iframe>
			<div class="app-panel__action">
				<Button color="black" size="medium" disabled={busy || (!done && left > 0)} onclick={collect}
					>Забрать награду</Button
				>
			</div>
		{:else if quest.action === 'visit'}
			<p class="app-muted xq-text">
				Страница откроется в новой вкладке. Посмотрите её и вернитесь сюда, награду можно забрать
				через {quest.seconds} секунд.
			</p>
			<div class="xq-bar">
				<span class="xq-timer" class:is-ready={left === 0 || done}>
					{#if done || left === 0}Можно забирать награду{:else if running}Осталось {left} с{:else}Таймер запустится после перехода{/if}
				</span>
			</div>
			<div class="app-panel__action">
				{#if !running && !done && left === quest.seconds}
					<Button
						color="black"
						size="medium"
						href={quest.url ?? '#'}
						onclick={() => begin()}
					>
						Перейти на страницу
					</Button>
				{:else}
					<Button color="black" size="medium" disabled={busy || (!done && left > 0)} onclick={collect}
						>Забрать награду</Button
					>
				{/if}
			</div>
		{:else if quest.action === 'watch'}
			{@const s = quest.slides[slide]}
			<div class="xq-slide">
				<p class="xq-slide__title">{s?.title}</p>
				<p class="xq-slide__text">{s?.text}</p>
				<div class="xq-dots">
					{#each quest.slides as _, i (i)}
						<span class="xq-dot" class:is-active={i === slide}></span>
					{/each}
				</div>
			</div>
			<div class="xq-bar">
				<span class="xq-timer" class:is-ready={left === 0 || done}>
					{#if done || left === 0}Можно забирать награду{:else}Осталось {left} с{/if}
				</span>
			</div>
			<div class="app-panel__action">
				<Button color="black" size="medium" disabled={busy || (!done && left > 0)} onclick={collect}
					>Забрать награду</Button
				>
			</div>
		{:else if quest.action === 'newsletter'}
			<p class="app-muted xq-text">
				Раз в неделю: новые уроки, задания и акции продуктов. Без спама, отписаться можно в любом
				письме.
			</p>
			<input class="lp-auth__input xq-input" type="email" placeholder="Email" bind:value={email} />
			<div class="app-panel__action">
				<Button color="black" size="medium" disabled={busy || !email} onclick={sendEmail}
					>Подписаться</Button
				>
			</div>
		{:else if quest.action === 'invite'}
			<p class="app-muted xq-text">
				Отправьте ссылку другу. Когда он зарегистрируется и закроет первый заказ, вы получите
				награду.
			</p>
			<div class="xq-copy">
				<input class="lp-auth__input xq-input" readonly value={inviteLink} />
				<Button color="gray" size="small" onclick={copy} disabled={!inviteLink}>
					{#if copied}<Check size={18} strokeWidth={2.5} />Скопировано{:else}<Copy
							size={18}
							strokeWidth={2.25}
						/>Копировать{/if}
				</Button>
			</div>
			<p class="mk-meta xq-progress">Приглашено: {quest.progress} из {quest.target}</p>
			{#if done}
				<div class="app-panel__action">
					<Button color="black" size="medium" disabled={busy} onclick={claimOnly}>Получить награду</Button>
				</div>
			{/if}
		{:else if quest.action === 'telegram'}
			{#if !telegramBot}
				<p class="app-muted xq-text">Канал скоро появится.</p>
			{:else}
				<p class="app-muted xq-text">
					1. Откройте бота и нажмите «Старт», чтобы связать аккаунт. 2. Подпишитесь на канал
					{quest.channel ?? ''}. 3. Вернитесь и нажмите «Проверить подписку».
				</p>
				{#if tgStatus === 'not_linked'}
					<p class="lp-auth__error">Аккаунт не связан: сначала нажмите «Старт» в боте.</p>
				{:else if tgStatus === 'not_member'}
					<p class="lp-auth__error">Подписка не найдена. Подпишитесь на канал и проверьте ещё раз.</p>
				{/if}
				<div class="xq-copy">
					<Button color="gray" size="small" href={botLink} disabled={!botLink}>
						Открыть бота <ExternalLink size={16} strokeWidth={2.25} />
					</Button>
					<Button color="black" size="small" disabled={busy || !code} onclick={checkTelegram}
						>Проверить подписку</Button
					>
				</div>
			{/if}
		{/if}
		{#if error}
			<p class="lp-auth__error">{error}</p>
		{/if}
	</div>
</div>

import { v } from 'convex/values';
import { httpAction, internalMutation, internalQuery } from './_generated/server';
import { action } from './_generated/server';
import { internal } from './_generated/api';
import { completeExternal } from './model/quests';
import { playerByReferralCode } from './model/referrals';
import { authComponent } from './auth';

const API = 'https://api.telegram.org/bot';

export const link = internalMutation({
	args: { code: v.string(), telegramUserId: v.string() },
	handler: async (ctx, { code, telegramUserId }) => {
		const player = await playerByReferralCode(ctx, code);
		if (!player) return false;
		await ctx.db.patch(player._id, { telegramUserId });
		return true;
	}
});

export const playerTelegram = internalQuery({
	args: { authId: v.string() },
	handler: async (ctx, { authId }) => {
		const player = await ctx.db
			.query('players')
			.withIndex('by_auth', (q) => q.eq('authId', authId))
			.unique();
		return player ? { id: player._id, telegramUserId: player.telegramUserId ?? null } : null;
	}
});

export const markSubscribed = internalMutation({
	args: { playerId: v.id('players'), slug: v.string() },
	handler: async (ctx, { playerId, slug }) => {
		await completeExternal(ctx, playerId, slug);
	}
});

export const check = action({
	args: { slug: v.string() },
	handler: async (
		ctx,
		{ slug }
	): Promise<'ok' | 'not_linked' | 'not_member' | 'not_configured'> => {
		const token = process.env.TELEGRAM_BOT_TOKEN;
		const channel = process.env.TELEGRAM_CHANNEL;
		if (!token || !channel) return 'not_configured';
		const user = await authComponent.getAuthUser(ctx);
		const player = await ctx.runQuery(internal.telegram.playerTelegram, { authId: user._id });
		if (!player?.telegramUserId) return 'not_linked';
		const res = await fetch(
			`${API}${token}/getChatMember?chat_id=${encodeURIComponent(channel)}&user_id=${player.telegramUserId}`
		);
		const data = (await res.json()) as { ok: boolean; result?: { status: string } };
		const status = data.result?.status ?? '';
		if (!data.ok || !['member', 'administrator', 'creator'].includes(status)) return 'not_member';
		await ctx.runMutation(internal.telegram.markSubscribed, { playerId: player.id, slug });
		return 'ok';
	}
});

export const webhook = httpAction(async (ctx, request) => {
	const token = process.env.TELEGRAM_BOT_TOKEN;
	const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
	if (secret && request.headers.get('x-telegram-bot-api-secret-token') !== secret)
		return new Response('forbidden', { status: 403 });
	const update = (await request.json()) as {
		message?: { text?: string; chat: { id: number }; from?: { id: number } };
	};
	const message = update.message;
	const text = message?.text ?? '';
	if (message?.from && text.startsWith('/start')) {
		const code = text.split(/\s+/)[1] ?? '';
		const linked = code
			? await ctx.runMutation(internal.telegram.link, {
					code,
					telegramUserId: String(message.from.id)
				})
			: false;
		const channel = process.env.TELEGRAM_CHANNEL ?? '';
		const reply = linked
			? `Аккаунт связан. Подпишитесь на канал ${channel} и нажмите «Проверить подписку» в игре.`
			: 'Откройте задание «Подписаться на Telegram» в игре и перейдите по ссылке оттуда.';
		if (token)
			await fetch(`${API}${token}/sendMessage`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ chat_id: message.chat.id, text: reply })
			});
	}
	return new Response('ok');
});

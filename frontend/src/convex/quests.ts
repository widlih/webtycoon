import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { requirePlayer } from './model/players';
import { ensureReferralCode } from './model/referrals';
import {
	claimQuest,
	finishExternal,
	listQuests,
	startExternal,
	subscribeNewsletter
} from './model/quests';

export const list = query({
	args: {},
	handler: async (ctx) => {
		const player = await requirePlayer(ctx);
		return await listQuests(ctx, player._id);
	}
});

export const claim = mutation({
	args: { slug: v.string() },
	handler: async (ctx, { slug }) => {
		const player = await requirePlayer(ctx);
		return await claimQuest(ctx, player, slug);
	}
});

export const start = mutation({
	args: { slug: v.string() },
	handler: async (ctx, { slug }) => {
		const player = await requirePlayer(ctx);
		await startExternal(ctx, player._id, slug);
	}
});

export const finish = mutation({
	args: { slug: v.string() },
	handler: async (ctx, { slug }) => {
		const player = await requirePlayer(ctx);
		await finishExternal(ctx, player._id, slug);
	}
});

export const subscribe = mutation({
	args: { email: v.string() },
	handler: async (ctx, { email }) => {
		const player = await requirePlayer(ctx);
		await subscribeNewsletter(ctx, player._id, email);
	}
});

export const referral = mutation({
	args: {},
	handler: async (ctx) => {
		const player = await requirePlayer(ctx);
		return await ensureReferralCode(ctx, player);
	}
});

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { requirePlayer } from './model/players';
import { claimQuest, listQuests } from './model/quests';

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

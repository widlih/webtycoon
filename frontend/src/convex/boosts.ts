import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { activeBoost, buyBoost } from './model/boosts';
import { requirePlayer } from './model/players';

export const list = query({
	args: {},
	handler: async (ctx) => {
		const player = await requirePlayer(ctx);
		const boosts = (await ctx.db.query('boosts').collect())
			.filter((b) => b.active)
			.sort((a, b) => a.order - b.order);
		const freelancer = await activeBoost(ctx, player._id, 'freelancer');
		const bonus = await activeBoost(ctx, player._id, 'bonus');
		return {
			boosts,
			freelancerUntil: freelancer?.expiresAt ?? null,
			bonusPending: Boolean(bonus)
		};
	}
});

export const buy = mutation({
	args: { slug: v.string() },
	handler: async (ctx, { slug }) => {
		const player = await requirePlayer(ctx);
		await buyBoost(ctx, player, slug);
	}
});

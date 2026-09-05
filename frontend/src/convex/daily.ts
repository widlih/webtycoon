import { mutation, query } from './_generated/server';
import { claimDaily, dailyState } from './model/dailyRewards';
import { getPlayer, requirePlayer } from './model/players';

export const state = query({
	args: {},
	handler: async (ctx) => {
		const player = await getPlayer(ctx);
		if (!player) return null;
		return dailyState(player);
	}
});

export const claim = mutation({
	args: {},
	handler: async (ctx) => {
		const player = await requirePlayer(ctx);
		return await claimDaily(ctx, player);
	}
});

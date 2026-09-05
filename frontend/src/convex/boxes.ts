import { mutation, query } from './_generated/server';
import { BOX_DAILY_LIMIT, BOX_DROPS, BOX_PRICE_PREMIUM } from './content/box';
import { boughtToday, openBox, type BoxPrize } from './model/boxes';
import { requirePlayer } from './model/players';

export const state = query({
	args: {},
	handler: async (ctx) => {
		const player = await requirePlayer(ctx);
		const opened = await boughtToday(ctx, player._id);
		const recent = (
			await ctx.db
				.query('boxOpens')
				.withIndex('by_player_period', (q) => q.eq('playerId', player._id))
				.order('desc')
				.take(5)
		).map((o) => ({
			_id: o._id,
			dropId: o.dropId,
			prize: o.prize as BoxPrize,
			createdAt: o.createdAt
		}));
		return {
			price: BOX_PRICE_PREMIUM,
			dailyLimit: BOX_DAILY_LIMIT,
			owned: player.boxes ?? 0,
			openedToday: opened.length,
			leftToday: Math.max(0, BOX_DAILY_LIMIT - opened.length),
			drops: BOX_DROPS.map(({ id, title, text }) => ({ id, title, text })),
			recent
		};
	}
});

export const open = mutation({
	args: {},
	handler: async (ctx) => {
		const player = await requirePlayer(ctx);
		return await openBox(ctx, player);
	}
});

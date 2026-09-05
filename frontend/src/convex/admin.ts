import { v } from 'convex/values';
import { internalMutation } from './_generated/server';

const playerTables = [
	'skills',
	'offices',
	'rooms',
	'inventory',
	'payrolls',
	'orders',
	'offerSlots',
	'ledger',
	'events',
	'lessonProgress',
	'quizRuns',
	'coupons',
	'playerBoosts',
	'boxOpens',
	'questProgress',
	'achievementProgress',
	'scores'
] as const;

export const deletePlayerByAuthId = internalMutation({
	args: { authId: v.string() },
	handler: async (ctx, { authId }) => {
		const player = await ctx.db
			.query('players')
			.withIndex('by_auth', (q) => q.eq('authId', authId))
			.unique();
		if (!player) return { deleted: 0 };
		let deleted = 0;
		const rooms = await ctx.db
			.query('rooms')
			.withIndex('by_player', (q) => q.eq('playerId', player._id))
			.collect();
		for (const room of rooms) {
			const items = await ctx.db
				.query('roomItems')
				.withIndex('by_room', (q) => q.eq('roomId', room._id))
				.collect();
			for (const item of items) {
				await ctx.db.delete(item._id);
				deleted++;
			}
		}
		for (const table of playerTables) {
			for (const doc of await ctx.db.query(table).collect()) {
				if (doc.playerId === player._id) {
					await ctx.db.delete(doc._id);
					deleted++;
				}
			}
		}
		await ctx.db.delete(player._id);
		return { deleted: deleted + 1 };
	}
});

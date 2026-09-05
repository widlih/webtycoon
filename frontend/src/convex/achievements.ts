import { query } from './_generated/server';
import { listAchievements } from './model/achievements';
import { requirePlayer } from './model/players';

export const list = query({
	args: {},
	handler: async (ctx) => {
		const player = await requirePlayer(ctx);
		return await listAchievements(ctx, player._id);
	}
});

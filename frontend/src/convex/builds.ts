import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { finishBuild, startBuild } from './model/builds';
import { requirePlayer } from './model/players';

export const start = mutation({
	args: { orderId: v.id('orders') },
	handler: async (ctx, { orderId }) => {
		const player = await requirePlayer(ctx);
		return await startBuild(ctx, player, orderId);
	}
});

export const finish = mutation({
	args: { runId: v.id('buildRuns'), lines: v.number() },
	handler: async (ctx, { runId, lines }) => {
		const player = await requirePlayer(ctx);
		return await finishBuild(ctx, player, runId, lines);
	}
});

import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { requirePlayer } from './model/players';
import { answerRun, startRun } from './model/quizzes';

export const start = mutation({
	args: { orderId: v.id('orders') },
	handler: async (ctx, { orderId }) => {
		const player = await requirePlayer(ctx);
		return await startRun(ctx, player, orderId);
	}
});

export const answer = mutation({
	args: { runId: v.id('quizRuns'), answers: v.array(v.number()) },
	handler: async (ctx, { runId, answers }) => {
		const player = await requirePlayer(ctx);
		return await answerRun(ctx, player, runId, answers);
	}
});

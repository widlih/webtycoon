import type { Doc, Id } from '../_generated/dataModel';
import type { MutationCtx } from '../_generated/server';
import { QUIZ_ENERGY_COST } from './constants';
import { spendEnergy } from './energy';
import { completeOrder } from './orders';

export const BUILD_PRODUCTS = ['ucoz', 'rusender', 'webask'] as const;

export function buildKind(product: string): 'build' | 'flow' | 'memory' {
	if (product === 'rusender') return 'flow';
	if (product === 'webask') return 'memory';
	return 'build';
}

export function memoryParams(durationMin: number): { pairs: number; seconds: number } {
	if (durationMin >= 12) return { pairs: 10, seconds: 120 };
	if (durationMin >= 8) return { pairs: 8, seconds: 90 };
	return { pairs: 6, seconds: 75 };
}

export function flowParams(durationMin: number): { size: number; seconds: number } {
	if (durationMin >= 12) return { size: 7, seconds: 120 };
	if (durationMin >= 8) return { size: 6, seconds: 90 };
	return { size: 5, seconds: 60 };
}

export function buildTarget(durationMin: number): number {
	return Math.max(3, Math.min(12, Math.round(durationMin / 1.5)));
}

export async function startBuild(ctx: MutationCtx, player: Doc<'players'>, orderId: Id<'orders'>) {
	const order = await ctx.db.get(orderId);
	if (!order || order.playerId !== player._id || order.status !== 'active')
		throw new Error('ORDER_NOT_ACTIVE');
	if (!(BUILD_PRODUCTS as readonly string[]).includes(order.product))
		throw new Error('BUILD_NOT_AVAILABLE');
	const openRuns = (
		await ctx.db
			.query('buildRuns')
			.withIndex('by_order', (q) => q.eq('orderId', orderId))
			.collect()
	).filter((r) => r.status === 'open');
	for (const run of openRuns) await ctx.db.patch(run._id, { status: 'failed' });
	await spendEnergy(ctx, player, QUIZ_ENERGY_COST);
	const durationMin =
		order.endsAt && order.startedAt ? (order.endsAt - order.startedAt) / 60000 : 6;
	const kind = buildKind(order.product);
	const flow = flowParams(durationMin);
	const memory = memoryParams(durationMin);
	const target = kind === 'build' ? buildTarget(durationMin) : 1;
	const runId = await ctx.db.insert('buildRuns', {
		playerId: player._id,
		orderId,
		product: order.product,
		kind,
		target,
		status: 'open',
		createdAt: Date.now()
	});
	return {
		runId,
		kind,
		target,
		size: flow.size,
		seconds: kind === 'memory' ? memory.seconds : flow.seconds,
		pairs: memory.pairs
	};
}

export async function finishBuild(
	ctx: MutationCtx,
	player: Doc<'players'>,
	runId: Id<'buildRuns'>,
	lines: number
) {
	const run = await ctx.db.get(runId);
	if (!run || run.playerId !== player._id) throw new Error('RUN_NOT_FOUND');
	if (run.status !== 'open') throw new Error('RUN_CLOSED');
	const passed = lines >= run.target;
	await ctx.db.patch(runId, { status: passed ? 'passed' : 'failed', lines });
	let reward: { coins: number; xp: number } | null = null;
	if (passed) {
		const order = await ctx.db.get(run.orderId);
		if (order && order.status === 'active')
			reward = await completeOrder(ctx, player, run.orderId, 'quiz');
	}
	return { passed, target: run.target, reward };
}

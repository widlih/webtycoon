import type { Doc, Id } from '../_generated/dataModel';
import type { MutationCtx } from '../_generated/server';
import { QUIZ_ENERGY_COST, QUIZ_PASS_THRESHOLD, QUIZ_QUESTIONS_PER_RUN } from './constants';
import { spendEnergy } from './energy';
import { emit } from './events';
import { completeOrder } from './orders';

function shuffle<T>(list: T[]): T[] {
	const copy = [...list];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}

export async function startRun(ctx: MutationCtx, player: Doc<'players'>, orderId: Id<'orders'>) {
	const order = await ctx.db.get(orderId);
	if (!order || order.playerId !== player._id || order.status !== 'active')
		throw new Error('ORDER_NOT_ACTIVE');
	const openRuns = (
		await ctx.db
			.query('quizRuns')
			.withIndex('by_order', (q) => q.eq('orderId', orderId))
			.collect()
	).filter((r) => r.status === 'open');
	for (const run of openRuns) await ctx.db.patch(run._id, { status: 'failed' });
	const pool = (
		await ctx.db
			.query('quizQuestions')
			.withIndex('by_product', (q) => q.eq('product', order.product))
			.collect()
	).filter((q) => q.active);
	if (pool.length < QUIZ_QUESTIONS_PER_RUN) throw new Error('NOT_ENOUGH_QUESTIONS');
	await spendEnergy(ctx, player, QUIZ_ENERGY_COST);
	const picked = shuffle(pool).slice(0, QUIZ_QUESTIONS_PER_RUN);
	const runId = await ctx.db.insert('quizRuns', {
		playerId: player._id,
		orderId,
		product: order.product,
		questionIds: picked.map((q) => q._id),
		status: 'open',
		createdAt: Date.now()
	});
	return {
		runId,
		questions: picked.map((q) => ({ id: q._id, question: q.question, options: q.options }))
	};
}

export async function answerRun(
	ctx: MutationCtx,
	player: Doc<'players'>,
	runId: Id<'quizRuns'>,
	answers: number[]
) {
	const run = await ctx.db.get(runId);
	if (!run || run.playerId !== player._id) throw new Error('RUN_NOT_FOUND');
	if (run.status !== 'open') throw new Error('RUN_CLOSED');
	if (answers.length !== run.questionIds.length) throw new Error('INVALID_ANSWERS');
	let correct = 0;
	const results: boolean[] = [];
	const correctAnswers: number[] = [];
	for (let i = 0; i < run.questionIds.length; i++) {
		const question = await ctx.db.get(run.questionIds[i]);
		const ok = question?.answer === answers[i];
		correctAnswers.push(question?.answer ?? -1);
		results.push(ok);
		if (ok) correct++;
	}
	const passed = correct >= QUIZ_PASS_THRESHOLD;
	await ctx.db.patch(runId, { status: passed ? 'passed' : 'failed', correct });
	let reward: { coins: number; xp: number } | null = null;
	if (passed) {
		const order = await ctx.db.get(run.orderId);
		if (order && order.status === 'active')
			reward = await completeOrder(ctx, player, run.orderId, 'quiz');
		await emit(ctx, player._id, { type: 'quiz.passed', product: run.product, correct });
	}
	return { passed, correct, results, correctAnswers, reward };
}

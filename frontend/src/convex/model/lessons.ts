import type { Doc } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import { emit } from './events';
import { grantReward } from './ledger';
import { raiseSkill, skillLevel } from './skills';

export async function completedSlugs(
	ctx: QueryCtx | MutationCtx,
	playerId: Doc<'players'>['_id']
): Promise<Set<string>> {
	const progress = await ctx.db
		.query('lessonProgress')
		.withIndex('by_player_lesson', (q) => q.eq('playerId', playerId))
		.collect();
	return new Set(progress.map((p) => p.lessonSlug));
}

export async function completeLesson(ctx: MutationCtx, player: Doc<'players'>, slug: string) {
	const lesson = await ctx.db
		.query('lessons')
		.withIndex('by_slug', (q) => q.eq('slug', slug))
		.unique();
	if (!lesson || !lesson.active) throw new Error('LESSON_NOT_FOUND');
	const done = await ctx.db
		.query('lessonProgress')
		.withIndex('by_player_lesson', (q) => q.eq('playerId', player._id).eq('lessonSlug', slug))
		.unique();
	if (done)
		return {
			alreadyCompleted: true,
			reward: null,
			skillLevel: await skillLevel(ctx, player._id, lesson.product)
		};
	await ctx.db.insert('lessonProgress', {
		playerId: player._id,
		lessonSlug: slug,
		completedAt: Date.now()
	});
	const current = await skillLevel(ctx, player._id, lesson.product);
	const level = await raiseSkill(ctx, player._id, lesson.product, current + 1);
	await grantReward(
		ctx,
		player._id,
		lesson.reward,
		'lesson.complete',
		`lesson:${player._id}:${slug}`,
		{ refType: 'lesson', refId: slug }
	);
	await emit(ctx, player._id, {
		type: 'lesson.completed',
		lessonSlug: slug,
		product: lesson.product,
		skillLevel: level,
		xp: lesson.reward.xp
	});
	return { alreadyCompleted: false, reward: lesson.reward, skillLevel: level };
}

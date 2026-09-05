import type { Doc, Id } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import { MAX_SKILL_LEVEL } from './constants';

export async function getSkill(
	ctx: QueryCtx | MutationCtx,
	playerId: Id<'players'>,
	product: string
): Promise<Doc<'skills'> | null> {
	return await ctx.db
		.query('skills')
		.withIndex('by_player_product', (q) => q.eq('playerId', playerId).eq('product', product))
		.unique();
}

export async function skillLevel(
	ctx: QueryCtx | MutationCtx,
	playerId: Id<'players'>,
	product: string
): Promise<number> {
	return (await getSkill(ctx, playerId, product))?.level ?? 0;
}

export async function raiseSkill(
	ctx: MutationCtx,
	playerId: Id<'players'>,
	product: string,
	to: number
): Promise<number> {
	const level = Math.min(MAX_SKILL_LEVEL, to);
	const existing = await getSkill(ctx, playerId, product);
	if (!existing) {
		await ctx.db.insert('skills', { playerId, product, level });
		return level;
	}
	if (existing.level < level) await ctx.db.patch(existing._id, { level });
	return Math.max(existing.level, level);
}

import type { Id } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import type { EventHandler } from './events';
import { grantReward } from './ledger';

type Rule = { event: string; count: number };

async function progressDoc(ctx: QueryCtx | MutationCtx, playerId: Id<'players'>, slug: string) {
	return await ctx.db
		.query('achievementProgress')
		.withIndex('by_player_slug', (q) => q.eq('playerId', playerId).eq('slug', slug))
		.unique();
}

export const onEvent: EventHandler = async (ctx, playerId, event) => {
	const all = (await ctx.db.query('achievements').collect()).filter((a) => a.active);
	for (const achievement of all) {
		const rule = achievement.rule as Rule;
		if (rule.event !== event.type) continue;
		const existing = await progressDoc(ctx, playerId, achievement.slug);
		if (existing?.unlockedAt) continue;
		const progress = (existing?.progress ?? 0) + 1;
		const unlockedAt = progress >= rule.count ? Date.now() : undefined;
		if (existing) await ctx.db.patch(existing._id, { progress, unlockedAt });
		else
			await ctx.db.insert('achievementProgress', {
				playerId,
				slug: achievement.slug,
				progress,
				unlockedAt
			});
		if (unlockedAt)
			await grantReward(
				ctx,
				playerId,
				achievement.reward,
				'achievement.unlock',
				`achievement:${playerId}:${achievement.slug}`,
				{ refType: 'achievement', refId: achievement.slug }
			);
	}
};

export async function listAchievements(ctx: QueryCtx | MutationCtx, playerId: Id<'players'>) {
	const all = (await ctx.db.query('achievements').collect())
		.filter((a) => a.active)
		.sort((a, b) => a.order - b.order);
	const result = [];
	for (const achievement of all) {
		const progress = await progressDoc(ctx, playerId, achievement.slug);
		result.push({
			slug: achievement.slug,
			title: achievement.title,
			description: achievement.description,
			reward: achievement.reward,
			target: (achievement.rule as Rule).count,
			progress: Math.min(progress?.progress ?? 0, (achievement.rule as Rule).count),
			unlockedAt: progress?.unlockedAt ?? null
		});
	}
	return result;
}

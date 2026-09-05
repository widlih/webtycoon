import { internalMutation, type MutationCtx } from './_generated/server';
import { achievements } from './content/achievements';
import { boosts } from './content/boosts';
import { couponTemplates } from './content/couponTemplates';
import { items } from './content/items';
import { lessons } from './content/lessons';
import { orderTemplates } from './content/orderTemplates';
import { quests } from './content/quests';
import { quizQuestions } from './content/quizQuestions';
import { workers } from './content/workers';

type SlugTable =
	| 'orderTemplates'
	| 'items'
	| 'couponTemplates'
	| 'lessons'
	| 'quests'
	| 'achievements'
	| 'workers'
	| 'boosts';

async function upsertBySlug(ctx: MutationCtx, table: SlugTable, rows: Array<{ slug: string }>) {
	for (const row of rows) {
		const existing = await ctx.db
			.query(table)
			.withIndex('by_slug', (q) => q.eq('slug', row.slug))
			.unique();
		if (existing) await ctx.db.replace(existing._id, row as never);
		else await ctx.db.insert(table, row as never);
	}
}

export const run = internalMutation({
	args: {},
	handler: async (ctx) => {
		await upsertBySlug(ctx, 'orderTemplates', orderTemplates);
		await upsertBySlug(ctx, 'items', items);
		await upsertBySlug(ctx, 'couponTemplates', couponTemplates);
		await upsertBySlug(ctx, 'lessons', lessons);
		await upsertBySlug(ctx, 'quests', quests);
		await upsertBySlug(ctx, 'achievements', achievements);
		await upsertBySlug(ctx, 'workers', workers);
		await upsertBySlug(ctx, 'boosts', boosts);
		for (const q of await ctx.db.query('quizQuestions').collect()) await ctx.db.delete(q._id);
		for (const q of quizQuestions) await ctx.db.insert('quizQuestions', q);
		const timeScale = await ctx.db
			.query('config')
			.withIndex('by_key', (q) => q.eq('key', 'timeScale'))
			.unique();
		if (!timeScale) await ctx.db.insert('config', { key: 'timeScale', value: 1 });
		return {
			orderTemplates: orderTemplates.length,
			items: items.length,
			couponTemplates: couponTemplates.length,
			lessons: lessons.length,
			quizQuestions: quizQuestions.length,
			quests: quests.length,
			achievements: achievements.length,
			workers: workers.length,
			boosts: boosts.length
		};
	}
});

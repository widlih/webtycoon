import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { completedSlugs, completeLesson } from './model/lessons';
import { requirePlayer } from './model/players';

export const list = query({
	args: { product: v.string() },
	handler: async (ctx, { product }) => {
		const player = await requirePlayer(ctx);
		const done = await completedSlugs(ctx, player._id);
		const lessons = await ctx.db
			.query('lessons')
			.withIndex('by_product', (q) => q.eq('product', product))
			.collect();
		return lessons
			.filter((l) => l.active)
			.sort((a, b) => a.order - b.order)
			.map((l) => ({
				slug: l.slug,
				title: l.title,
				description: l.description,
				order: l.order,
				reward: l.reward,
				steps: l.steps,
				completed: done.has(l.slug)
			}));
	}
});

export const complete = mutation({
	args: { slug: v.string() },
	handler: async (ctx, { slug }) => {
		const player = await requirePlayer(ctx);
		return await completeLesson(ctx, player, slug);
	}
});

export const get = query({
	args: { slug: v.string() },
	handler: async (ctx, { slug }) => {
		const player = await requirePlayer(ctx);
		const lesson = await ctx.db
			.query('lessons')
			.withIndex('by_slug', (q) => q.eq('slug', slug))
			.unique();
		if (!lesson || !lesson.active) return null;
		const done = await completedSlugs(ctx, player._id);
		return {
			slug: lesson.slug,
			product: lesson.product,
			title: lesson.title,
			description: lesson.description,
			steps: lesson.steps,
			reward: lesson.reward,
			completed: done.has(lesson.slug)
		};
	}
});

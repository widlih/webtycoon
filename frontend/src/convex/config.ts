import { v } from 'convex/values';
import { query } from './_generated/server';

export const get = query({
	args: { key: v.string() },
	handler: async (ctx, { key }) => {
		const doc = await ctx.db
			.query('config')
			.withIndex('by_key', (q) => q.eq('key', key))
			.unique();
		return doc?.value ?? null;
	}
});

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { emit } from './model/events';
import { spend } from './model/ledger';
import { requirePlayer } from './model/players';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateCode(): string {
	let code = '';
	for (let i = 0; i < 8; i++) code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
	return `${code.slice(0, 4)}-${code.slice(4)}`;
}

export const templates = query({
	args: {},
	handler: async (ctx) => {
		await requirePlayer(ctx);
		return await ctx.db.query('couponTemplates').collect();
	}
});

export const mine = query({
	args: {},
	handler: async (ctx) => {
		const player = await requirePlayer(ctx);
		const coupons = await ctx.db
			.query('coupons')
			.withIndex('by_player', (q) => q.eq('playerId', player._id))
			.order('desc')
			.collect();
		const result = [];
		for (const coupon of coupons) {
			const template = await ctx.db
				.query('couponTemplates')
				.withIndex('by_slug', (q) => q.eq('slug', coupon.templateSlug))
				.unique();
			result.push({
				...coupon,
				title: template?.title ?? coupon.templateSlug,
				discount: template?.discount ?? '',
				product: template?.product ?? ''
			});
		}
		return result;
	}
});

export const buy = mutation({
	args: { templateSlug: v.string() },
	handler: async (ctx, { templateSlug }) => {
		const player = await requirePlayer(ctx);
		const template = await ctx.db
			.query('couponTemplates')
			.withIndex('by_slug', (q) => q.eq('slug', templateSlug))
			.unique();
		if (!template) throw new Error('COUPON_NOT_FOUND');
		let code = generateCode();
		while (
			await ctx.db
				.query('coupons')
				.withIndex('by_code', (q) => q.eq('code', code))
				.unique()
		) {
			code = generateCode();
		}
		await spend(ctx, {
			playerId: player._id,
			currency: 'coins',
			amount: template.price,
			reason: 'coupon.buy',
			key: `coupon:${code}`
		});
		const now = Date.now();
		const id = await ctx.db.insert('coupons', {
			playerId: player._id,
			templateSlug,
			code,
			status: 'active',
			issuedAt: now,
			expiresAt: now + template.ttlDays * 24 * 60 * 60 * 1000
		});
		await emit(ctx, player._id, { type: 'coupon.bought', templateSlug, product: template.product });
		return { id, code };
	}
});

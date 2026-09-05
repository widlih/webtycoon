import type { Doc, Id } from '../_generated/dataModel';
import type { MutationCtx } from '../_generated/server';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateCode(): string {
	let code = '';
	for (let i = 0; i < 8; i++) code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
	return `${code.slice(0, 4)}-${code.slice(4)}`;
}

export async function uniqueCouponCode(ctx: MutationCtx): Promise<string> {
	let code = generateCode();
	while (
		await ctx.db
			.query('coupons')
			.withIndex('by_code', (q) => q.eq('code', code))
			.unique()
	) {
		code = generateCode();
	}
	return code;
}

export async function issueCoupon(
	ctx: MutationCtx,
	playerId: Id<'players'>,
	template: Doc<'couponTemplates'>,
	code: string
) {
	const now = Date.now();
	return await ctx.db.insert('coupons', {
		playerId,
		templateSlug: template.slug,
		code,
		status: 'active',
		issuedAt: now,
		expiresAt: now + template.ttlDays * 24 * 60 * 60 * 1000
	});
}

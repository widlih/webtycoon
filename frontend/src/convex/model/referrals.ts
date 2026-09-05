import type { Doc, Id } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import { emit, type EventHandler } from './events';

const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

export function newReferralCode(): string {
	let code = '';
	for (let i = 0; i < 6; i++) code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
	return code;
}

export async function playerByReferralCode(
	ctx: QueryCtx | MutationCtx,
	code: string
): Promise<Doc<'players'> | null> {
	return await ctx.db
		.query('players')
		.withIndex('by_referral_code', (q) => q.eq('referralCode', code.toLowerCase()))
		.unique();
}

export async function ensureReferralCode(
	ctx: MutationCtx,
	player: Doc<'players'>
): Promise<string> {
	if (player.referralCode) return player.referralCode;
	let code = newReferralCode();
	while (await playerByReferralCode(ctx, code)) code = newReferralCode();
	await ctx.db.patch(player._id, { referralCode: code });
	return code;
}

export const onEvent: EventHandler = async (ctx, playerId, event) => {
	if (event.type !== 'order.completed') return;
	const player = await ctx.db.get(playerId);
	if (!player?.referredBy || player.referralRewarded) return;
	const referrer = await ctx.db.get(player.referredBy as Id<'players'>);
	if (!referrer) return;
	await ctx.db.patch(playerId, { referralRewarded: true });
	await emit(ctx, referrer._id, { type: 'referral.completed', referredId: playerId });
};

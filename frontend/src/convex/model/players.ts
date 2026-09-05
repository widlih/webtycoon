import type { Doc } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import { authComponent } from '../auth';
import { emit } from './events';
import { bootstrapOffice } from './office';
import { newReferralCode, playerByReferralCode } from './referrals';

export async function getPlayer(ctx: QueryCtx | MutationCtx): Promise<Doc<'players'> | null> {
	const user = await authComponent.safeGetAuthUser(ctx);
	if (!user) return null;
	return await ctx.db
		.query('players')
		.withIndex('by_auth', (q) => q.eq('authId', user._id))
		.unique();
}

export async function requirePlayer(ctx: QueryCtx | MutationCtx): Promise<Doc<'players'>> {
	const player = await getPlayer(ctx);
	if (!player) throw new Error('UNAUTHENTICATED');
	return player;
}

export async function ensurePlayer(ctx: MutationCtx, ref?: string): Promise<Doc<'players'>> {
	const user = await authComponent.getAuthUser(ctx);
	const existing = await ctx.db
		.query('players')
		.withIndex('by_auth', (q) => q.eq('authId', user._id))
		.unique();
	if (existing) return existing;
	let referralCode = newReferralCode();
	while (await playerByReferralCode(ctx, referralCode)) referralCode = newReferralCode();
	const referrer = ref ? await playerByReferralCode(ctx, ref) : null;
	const id = await ctx.db.insert('players', {
		authId: user._id,
		nick: user.name || user.email.split('@')[0],
		xp: 0,
		level: 1,
		coins: 0,
		premium: 0,
		energy: 8,
		energyUpdatedAt: Date.now(),
		referralCode,
		referredBy: referrer?._id,
		createdAt: Date.now()
	});
	const player = (await ctx.db.get(id))!;
	await bootstrapOffice(ctx, player);
	await emit(ctx, player._id, { type: 'player.created' });
	return (await ctx.db.get(id))!;
}

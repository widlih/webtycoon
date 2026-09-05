import type { Doc, Id } from '../_generated/dataModel';
import type { MutationCtx } from '../_generated/server';
import { levelForXp } from './constants';
import { addScore } from './leaderboard';

export type Currency = Doc<'ledger'>['currency'];

type Entry = {
	playerId: Id<'players'>;
	currency: Currency;
	amount: number;
	reason: string;
	key: string;
	refType?: string;
	refId?: string;
};

type Result = { applied: boolean; balance: number };

async function existingByKey(ctx: MutationCtx, key: string) {
	return await ctx.db
		.query('ledger')
		.withIndex('by_key', (q) => q.eq('key', key))
		.unique();
}

async function apply(ctx: MutationCtx, entry: Entry, delta: number): Promise<Result> {
	const prior = await existingByKey(ctx, entry.key);
	if (prior) return { applied: false, balance: prior.balanceAfter };
	const player = await ctx.db.get(entry.playerId);
	if (!player) throw new Error('PLAYER_NOT_FOUND');
	const balance = (player[entry.currency] ?? 0) + delta;
	if (balance < 0) throw new Error('INSUFFICIENT_FUNDS');
	const patch: Partial<Doc<'players'>> = { [entry.currency]: balance };
	if (entry.currency === 'xp') patch.level = levelForXp(balance);
	await ctx.db.patch(entry.playerId, patch);
	if (entry.currency === 'xp' && delta > 0) await addScore(ctx, entry.playerId, delta);
	await ctx.db.insert('ledger', {
		playerId: entry.playerId,
		currency: entry.currency,
		delta,
		balanceAfter: balance,
		reason: entry.reason,
		refType: entry.refType,
		refId: entry.refId,
		key: entry.key,
		createdAt: Date.now()
	});
	return { applied: true, balance };
}

export async function grant(ctx: MutationCtx, entry: Entry): Promise<Result> {
	if (entry.amount <= 0) throw new Error('INVALID_AMOUNT');
	return apply(ctx, entry, entry.amount);
}

export async function spend(ctx: MutationCtx, entry: Entry): Promise<Result> {
	if (entry.amount <= 0) throw new Error('INVALID_AMOUNT');
	if (entry.currency === 'xp') throw new Error('INVALID_CURRENCY');
	return apply(ctx, entry, -entry.amount);
}

export async function grantReward(
	ctx: MutationCtx,
	playerId: Id<'players'>,
	reward: { coins?: number; xp?: number; premium?: number },
	reason: string,
	key: string,
	ref?: { refType: string; refId: string }
) {
	const parts: Array<[Currency, number | undefined]> = [
		['coins', reward.coins],
		['xp', reward.xp],
		['premium', reward.premium]
	];
	for (const [currency, amount] of parts) {
		if (!amount || amount <= 0) continue;
		await grant(ctx, { playerId, currency, amount, reason, key: `${key}:${currency}`, ...ref });
	}
}

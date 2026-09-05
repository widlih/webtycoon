import type { Doc, Id } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import { ENERGY_MAX } from './constants';
import { energyState } from './energy';
import { spend } from './ledger';

type Ctx = QueryCtx | MutationCtx;

export async function activeBoost(
	ctx: Ctx,
	playerId: Id<'players'>,
	kind: string,
	now = Date.now()
) {
	const rows = await ctx.db
		.query('playerBoosts')
		.withIndex('by_player_kind', (q) => q.eq('playerId', playerId).eq('kind', kind))
		.collect();
	return rows.find((b) => b.expiresAt === undefined || b.expiresAt > now) ?? null;
}

export async function consumeBoost(ctx: MutationCtx, playerId: Id<'players'>, kind: string) {
	const boost = await activeBoost(ctx, playerId, kind);
	if (boost) await ctx.db.delete(boost._id);
	return Boolean(boost);
}

export async function buyBoost(ctx: MutationCtx, player: Doc<'players'>, slug: string) {
	const boost = await ctx.db
		.query('boosts')
		.withIndex('by_slug', (q) => q.eq('slug', slug))
		.unique();
	if (!boost || !boost.active) throw new Error('BOOST_NOT_FOUND');
	const now = Date.now();
	if (boost.kind === 'energy' && energyState(player, now).energy >= ENERGY_MAX)
		throw new Error('ENERGY_FULL');
	const activeOrders =
		boost.kind === 'overtime'
			? (
					await ctx.db
						.query('orders')
						.withIndex('by_player_status', (q) =>
							q.eq('playerId', player._id).eq('status', 'active')
						)
						.collect()
				).filter((o) => (o.endsAt ?? 0) > now)
			: [];
	if (boost.kind === 'overtime' && activeOrders.length === 0) throw new Error('NO_ACTIVE_ORDERS');
	if (
		(boost.kind === 'freelancer' || boost.kind === 'bonus') &&
		(await activeBoost(ctx, player._id, boost.kind, now))
	)
		throw new Error('BOOST_ALREADY_ACTIVE');

	await spend(ctx, {
		playerId: player._id,
		currency: 'coins',
		amount: boost.price,
		reason: `boost.${boost.kind}`,
		key: `boost:${player._id}:${slug}:${now}`
	});

	if (boost.kind === 'energy') {
		const state = energyState(player, now);
		await ctx.db.patch(player._id, {
			energy: Math.min(ENERGY_MAX, state.energy + boost.value),
			energyUpdatedAt: now
		});
	} else if (boost.kind === 'overtime') {
		for (const order of activeOrders)
			await ctx.db.patch(order._id, {
				endsAt: now + Math.round(((order.endsAt ?? now) - now) * boost.value)
			});
	} else if (boost.kind === 'freelancer') {
		await ctx.db.insert('playerBoosts', {
			playerId: player._id,
			kind: 'freelancer',
			expiresAt: now + (boost.durationMin ?? 60) * 60_000,
			createdAt: now
		});
	} else {
		await ctx.db.insert('playerBoosts', { playerId: player._id, kind: 'bonus', createdAt: now });
	}
}

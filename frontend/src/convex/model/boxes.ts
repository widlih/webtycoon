import type { Doc, Id } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import { BOX_DAILY_LIMIT, BOX_DROPS, BOX_PRICE_PREMIUM, type BoxDropEntry } from '../content/box';
import { activeBoost } from './boosts';
import { ENERGY_MAX, periodKey } from './constants';
import { issueCoupon, uniqueCouponCode } from './coupons';
import { energyState } from './energy';
import { emit } from './events';
import { grant, spend } from './ledger';

type Ctx = QueryCtx | MutationCtx;

export type BoxPrize =
	| { kind: 'coins'; amount: number }
	| { kind: 'xp'; amount: number }
	| { kind: 'energy'; amount: number }
	| { kind: 'premium'; amount: number }
	| { kind: 'boost'; boost: 'bonus' | 'freelancer'; title: string; extended: boolean }
	| { kind: 'item'; slug: string; name: string }
	| { kind: 'coupon'; templateSlug: string; title: string; code: string; discount: string };

/** Боксы, купленные сегодня за премиум. Подаренные (source = 'reward') в лимит не входят. */
export async function boughtToday(ctx: Ctx, playerId: Id<'players'>, now = Date.now()) {
	const rows = await ctx.db
		.query('boxOpens')
		.withIndex('by_player_period', (q) =>
			q.eq('playerId', playerId).eq('periodKey', periodKey(now))
		)
		.collect();
	return rows.filter((row) => row.source !== 'reward');
}

/** Начисляет игроку боксы, которые можно открыть бесплатно (награда за рейтинг и т. п.). */
export async function grantBoxes(ctx: MutationCtx, playerId: Id<'players'>, amount: number) {
	if (amount <= 0) return;
	const player = await ctx.db.get(playerId);
	if (!player) throw new Error('PLAYER_NOT_FOUND');
	await ctx.db.patch(playerId, { boxes: (player.boxes ?? 0) + amount });
}

function randomInt(min: number, max: number) {
	return min + Math.floor(Math.random() * (max - min + 1));
}

function pickWeighted(pool: BoxDropEntry[]): BoxDropEntry {
	const total = pool.reduce((sum, d) => sum + d.weight, 0);
	let roll = Math.random() * total;
	for (const entry of pool) {
		roll -= entry.weight;
		if (roll < 0) return entry;
	}
	return pool[pool.length - 1];
}

async function availableItems(ctx: Ctx, player: Doc<'players'>) {
	return (await ctx.db.query('items').collect()).filter((i) => i.unlockLevel <= player.level);
}

async function buildPool(ctx: MutationCtx, player: Doc<'players'>, now: number) {
	const pool: BoxDropEntry[] = [];
	for (const entry of BOX_DROPS) {
		const drop = entry.drop;
		if (drop.kind === 'energy' && energyState(player, now).energy >= ENERGY_MAX) continue;
		if (
			drop.kind === 'boost' &&
			drop.boost === 'bonus' &&
			(await activeBoost(ctx, player._id, 'bonus', now))
		)
			continue;
		if (drop.kind === 'item' && (await availableItems(ctx, player)).length === 0) continue;
		if (drop.kind === 'coupon' && (await ctx.db.query('couponTemplates').first()) === null)
			continue;
		pool.push(entry);
	}
	return pool;
}

async function applyDrop(
	ctx: MutationCtx,
	player: Doc<'players'>,
	entry: BoxDropEntry,
	key: string,
	now: number
): Promise<BoxPrize> {
	const drop = entry.drop;
	if (drop.kind === 'coins' || drop.kind === 'xp' || drop.kind === 'premium') {
		const amount = randomInt(drop.min, drop.max);
		await grant(ctx, {
			playerId: player._id,
			currency: drop.kind,
			amount,
			reason: `box.${drop.kind}`,
			key: `${key}:${drop.kind}`
		});
		return { kind: drop.kind, amount };
	}
	if (drop.kind === 'energy') {
		const state = energyState(player, now);
		const amount = Math.min(randomInt(drop.min, drop.max), ENERGY_MAX - state.energy);
		const energy = state.energy + amount;
		await ctx.db.patch(player._id, {
			energy,
			energyUpdatedAt: energy >= ENERGY_MAX ? now : state.updatedAt
		});
		return { kind: 'energy', amount };
	}
	if (drop.kind === 'boost') {
		const catalog = await ctx.db
			.query('boosts')
			.withIndex('by_slug', (q) => q.eq('slug', drop.boost))
			.unique();
		const title = catalog?.title ?? entry.title;
		if (drop.boost === 'freelancer') {
			const durationMs = (catalog?.durationMin ?? 60) * 60_000;
			const active = await activeBoost(ctx, player._id, 'freelancer', now);
			if (active) {
				await ctx.db.patch(active._id, { expiresAt: (active.expiresAt ?? now) + durationMs });
				return { kind: 'boost', boost: 'freelancer', title, extended: true };
			}
			await ctx.db.insert('playerBoosts', {
				playerId: player._id,
				kind: 'freelancer',
				expiresAt: now + durationMs,
				createdAt: now
			});
			return { kind: 'boost', boost: 'freelancer', title, extended: false };
		}
		await ctx.db.insert('playerBoosts', { playerId: player._id, kind: 'bonus', createdAt: now });
		return { kind: 'boost', boost: 'bonus', title, extended: false };
	}
	if (drop.kind === 'item') {
		const items = await availableItems(ctx, player);
		const item = items[randomInt(0, items.length - 1)];
		await ctx.db.insert('inventory', {
			playerId: player._id,
			kind: 'item',
			slug: item.slug,
			createdAt: now
		});
		return { kind: 'item', slug: item.slug, name: item.name };
	}
	const templates = await ctx.db.query('couponTemplates').collect();
	const template = templates[randomInt(0, templates.length - 1)];
	const code = await uniqueCouponCode(ctx);
	await issueCoupon(ctx, player._id, template, code);
	return {
		kind: 'coupon',
		templateSlug: template.slug,
		title: template.title,
		code,
		discount: template.discount
	};
}

/**
 * Открывает бокс. Сначала тратятся подаренные боксы (бесплатно и без дневного лимита),
 * затем бокс покупается за премиум с учётом лимита покупок в день.
 */
export async function openBox(ctx: MutationCtx, player: Doc<'players'>) {
	const now = Date.now();
	const owned = player.boxes ?? 0;
	const free = owned > 0;
	const bought = await boughtToday(ctx, player._id, now);
	const key = `box:${player._id}:${now}:${free ? 'reward' : bought.length}`;
	if (free) {
		await ctx.db.patch(player._id, { boxes: owned - 1 });
	} else {
		if (bought.length >= BOX_DAILY_LIMIT) throw new Error('BOX_DAILY_LIMIT');
		await spend(ctx, {
			playerId: player._id,
			currency: 'premium',
			amount: BOX_PRICE_PREMIUM,
			reason: 'box.buy',
			key
		});
	}
	const entry = pickWeighted(await buildPool(ctx, player, now));
	const prize = await applyDrop(ctx, player, entry, key, now);
	await ctx.db.insert('boxOpens', {
		playerId: player._id,
		periodKey: periodKey(now),
		dropId: entry.id,
		prize,
		source: free ? 'reward' : 'buy',
		createdAt: now
	});
	await emit(ctx, player._id, { type: 'box.opened', dropId: entry.id });
	return {
		dropId: entry.id,
		prize,
		owned: free ? owned - 1 : owned,
		leftToday: BOX_DAILY_LIMIT - bought.length - (free ? 0 : 1)
	};
}

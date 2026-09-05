import { internal } from '../_generated/api';
import type { Doc, Id } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import { activeBoost, consumeBoost } from './boosts';
import {
	BONUS_MULTIPLIER,
	FREELANCER_SPEED,
	MAX_ITEM_SPEED_BONUS,
	OFFER_COOLDOWN_MS,
	OFFER_SLOT_PRICES,
	OFFER_SLOTS_MAX,
	OFFER_SLOTS_START,
	QUIZ_BONUS_MULTIPLIER,
	SKILL_REWARD_BONUS,
	SKILL_SPEED_BONUS
} from './constants';
import { emit } from './events';
import { grantReward, spend } from './ledger';
import { itemsOfRoom, requireOwnRoom } from './office';
import { skillLevel } from './skills';

type Ctx = QueryCtx | MutationCtx;

export async function timeScale(ctx: Ctx): Promise<number> {
	const doc = await ctx.db
		.query('config')
		.withIndex('by_key', (q) => q.eq('key', 'timeScale'))
		.unique();
	const value = Number(doc?.value ?? 1);
	return Number.isFinite(value) && value > 0 ? value : 1;
}

export async function roomEffects(
	ctx: Ctx,
	roomId: Id<'rooms'>
): Promise<{ speed: number; reward: number }> {
	const installed = await itemsOfRoom(ctx, roomId);
	let speed = 0;
	let reward = 0;
	for (const entry of installed) {
		const item = await ctx.db
			.query('items')
			.withIndex('by_slug', (q) => q.eq('slug', entry.itemSlug))
			.unique();
		const effect = (item?.effect ?? {}) as { speed?: number; reward?: number };
		speed += effect.speed ?? 0;
		reward += effect.reward ?? 0;
	}
	return { speed: Math.min(MAX_ITEM_SPEED_BONUS, speed), reward };
}

export async function activeOrderOfRoom(
	ctx: Ctx,
	roomId: Id<'rooms'>
): Promise<Doc<'orders'> | null> {
	const orders = await ctx.db
		.query('orders')
		.withIndex('by_room', (q) => q.eq('roomId', roomId))
		.collect();
	return orders.find((o) => o.status === 'active') ?? null;
}

async function templatePool(ctx: MutationCtx, playerId: Id<'players'>) {
	const skills = await ctx.db
		.query('skills')
		.withIndex('by_player_product', (q) => q.eq('playerId', playerId))
		.collect();
	const pool: Doc<'orderTemplates'>[] = [];
	for (const skill of skills) {
		const templates = await ctx.db
			.query('orderTemplates')
			.withIndex('by_product', (q) => q.eq('product', skill.product))
			.collect();
		pool.push(...templates.filter((t) => t.active && t.minSkill <= Math.max(1, skill.level)));
	}
	return pool;
}

export function unlockedSlots(player: Doc<'players'>): number {
	return Math.min(OFFER_SLOTS_MAX, player.offerSlotsUnlocked ?? OFFER_SLOTS_START);
}

export async function slotsOf(ctx: QueryCtx | MutationCtx, playerId: Id<'players'>) {
	return (
		await ctx.db
			.query('offerSlots')
			.withIndex('by_player', (q) => q.eq('playerId', playerId))
			.collect()
	).sort((a, b) => a.index - b.index);
}

export async function fillSlot(ctx: MutationCtx, slot: Doc<'offerSlots'>) {
	const pool = await templatePool(ctx, slot.playerId);
	if (pool.length === 0) return;
	const template = pool[Math.floor(Math.random() * pool.length)];
	await ctx.db.patch(slot._id, {
		templateSlug: template.slug,
		product: template.product,
		readyAt: undefined
	});
}

export async function ensureSlots(ctx: MutationCtx, player: Doc<'players'>) {
	const slots = await slotsOf(ctx, player._id);
	const unlocked = unlockedSlots(player);
	const now = Date.now();
	for (let index = 0; index < unlocked; index++) {
		let slot = slots.find((s) => s.index === index);
		if (!slot) {
			const id = await ctx.db.insert('offerSlots', { playerId: player._id, index });
			slot = (await ctx.db.get(id))!;
		}
		if (!slot.templateSlug && (slot.readyAt === undefined || slot.readyAt <= now))
			await fillSlot(ctx, slot);
	}
}

export async function unlockSlot(ctx: MutationCtx, player: Doc<'players'>) {
	const unlocked = unlockedSlots(player);
	if (unlocked >= OFFER_SLOTS_MAX) throw new Error('ALL_SLOTS_UNLOCKED');
	const price = OFFER_SLOT_PRICES[unlocked];
	await spend(ctx, {
		playerId: player._id,
		currency: 'coins',
		amount: price,
		reason: 'offerSlot.unlock',
		key: `offerSlot:${player._id}:${unlocked}`
	});
	await ctx.db.patch(player._id, { offerSlotsUnlocked: unlocked + 1 });
	await ensureSlots(ctx, (await ctx.db.get(player._id))!);
}

export async function assignSlot(
	ctx: MutationCtx,
	player: Doc<'players'>,
	slotId: Id<'offerSlots'>,
	roomId: Id<'rooms'>
) {
	const slot = await ctx.db.get(slotId);
	if (!slot || slot.playerId !== player._id || !slot.templateSlug || !slot.product)
		throw new Error('OFFER_NOT_FOUND');
	const room = await requireOwnRoom(ctx, player, roomId);
	if (!room.worker) throw new Error('NO_WORKER');
	if (room.product !== slot.product) throw new Error('WRONG_DEPARTMENT');
	if (await activeOrderOfRoom(ctx, roomId)) throw new Error('ORDER_IN_PROGRESS');
	const template = await ctx.db
		.query('orderTemplates')
		.withIndex('by_slug', (q) => q.eq('slug', slot.templateSlug!))
		.unique();
	if (!template) throw new Error('TEMPLATE_NOT_FOUND');
	const skill = await skillLevel(ctx, player._id, room.product);
	const effects = await roomEffects(ctx, roomId);
	const scale = await timeScale(ctx);
	const workerSpeed = room.worker.speed ?? 0;
	const freelancer = (await activeBoost(ctx, player._id, 'freelancer')) ? FREELANCER_SPEED : 1;
	const speedFactor =
		Math.max(0.2, 1 - SKILL_SPEED_BONUS * Math.max(0, skill - 1) - effects.speed - workerSpeed) *
		freelancer;
	const durationMs = Math.round((template.durationMin * 60_000 * speedFactor) / scale);
	const rewardFactor = 1 + SKILL_REWARD_BONUS * Math.max(0, skill - 1) + effects.reward;
	const now = Date.now();
	const orderId = await ctx.db.insert('orders', {
		playerId: player._id,
		roomId,
		product: room.product,
		templateSlug: template.slug,
		status: 'active',
		startedAt: now,
		endsAt: now + durationMs,
		reward: {
			coins: Math.round(template.reward.coins * rewardFactor),
			xp: Math.round(template.reward.xp * rewardFactor)
		}
	});
	const readyAt = now + Math.round(OFFER_COOLDOWN_MS / scale);
	await ctx.db.patch(slot._id, { templateSlug: undefined, product: undefined, readyAt });
	await ctx.scheduler.runAt(readyAt, internal.orders.spawn, { slotId: slot._id });
	return orderId;
}

export async function completeOrder(
	ctx: MutationCtx,
	player: Doc<'players'>,
	orderId: Id<'orders'>,
	via: 'worker' | 'quiz'
) {
	const order = await ctx.db.get(orderId);
	if (!order || order.playerId !== player._id) throw new Error('ORDER_NOT_FOUND');
	if (order.status !== 'active') throw new Error('ORDER_NOT_ACTIVE');
	if (via === 'worker' && (order.endsAt ?? 0) > Date.now()) throw new Error('ORDER_NOT_READY');
	const bonus = (await consumeBoost(ctx, player._id, 'bonus')) ? BONUS_MULTIPLIER : 1;
	const multiplier = (via === 'quiz' ? QUIZ_BONUS_MULTIPLIER : 1) * bonus;
	const reward = {
		coins: Math.round(order.reward.coins * multiplier),
		xp: Math.round(order.reward.xp * multiplier)
	};
	await ctx.db.patch(orderId, { status: 'done', completedAt: Date.now(), reward });
	await grantReward(ctx, player._id, reward, `order.${via}`, `order:${orderId}`, {
		refType: 'order',
		refId: orderId
	});
	await emit(ctx, player._id, {
		type: 'order.completed',
		orderId,
		product: order.product,
		via,
		xp: reward.xp
	});
	return reward;
}

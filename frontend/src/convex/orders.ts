import { v } from 'convex/values';
import { internalMutation, mutation, query } from './_generated/server';
import { OFFER_SLOT_PRICES, OFFER_SLOTS_MAX } from './model/constants';
import {
	assignSlot,
	completeOrder,
	ensureSlots,
	fillSlot,
	slotsOf,
	swapSlot,
	unlockedSlots,
	unlockSlot
} from './model/orders';
import { requirePlayer } from './model/players';

export const slots = query({
	args: {},
	handler: async (ctx) => {
		const player = await requirePlayer(ctx);
		const unlocked = unlockedSlots(player);
		const docs = await slotsOf(ctx, player._id);
		const result = [];
		for (const slot of docs) {
			if (slot.index >= unlocked) continue;
			const template = slot.templateSlug
				? await ctx.db
						.query('orderTemplates')
						.withIndex('by_slug', (q) => q.eq('slug', slot.templateSlug!))
						.unique()
				: null;
			result.push({
				_id: slot._id,
				index: slot.index,
				readyAt: slot.readyAt ?? null,
				swapped: slot.swapped ?? false,
				offer: template
					? {
							title: template.title,
							product: template.product,
							durationMin: template.durationMin,
							reward: template.reward
						}
					: null
			});
		}
		return {
			slots: result,
			unlocked,
			max: OFFER_SLOTS_MAX,
			nextPrice: unlocked < OFFER_SLOTS_MAX ? OFFER_SLOT_PRICES[unlocked] : null
		};
	}
});

export const refill = mutation({
	args: {},
	handler: async (ctx) => {
		const player = await requirePlayer(ctx);
		await ensureSlots(ctx, player);
	}
});

export const unlock = mutation({
	args: {},
	handler: async (ctx) => {
		const player = await requirePlayer(ctx);
		await unlockSlot(ctx, player);
	}
});

export const assign = mutation({
	args: { slotId: v.id('offerSlots'), roomId: v.id('rooms') },
	handler: async (ctx, { slotId, roomId }) => {
		const player = await requirePlayer(ctx);
		return await assignSlot(ctx, player, slotId, roomId);
	}
});

export const swap = mutation({
	args: { slotId: v.id('offerSlots') },
	handler: async (ctx, { slotId }) => {
		const player = await requirePlayer(ctx);
		await swapSlot(ctx, player, slotId);
	}
});

export const spawn = internalMutation({
	args: { slotId: v.id('offerSlots') },
	handler: async (ctx, { slotId }) => {
		const slot = await ctx.db.get(slotId);
		if (!slot || slot.templateSlug) return;
		if (slot.readyAt !== undefined && slot.readyAt > Date.now()) return;
		await fillSlot(ctx, slot);
	}
});

export const active = query({
	args: {},
	handler: async (ctx) => {
		const player = await requirePlayer(ctx);
		const orders = await ctx.db
			.query('orders')
			.withIndex('by_player_status', (q) => q.eq('playerId', player._id).eq('status', 'active'))
			.collect();
		const result = [];
		for (const order of orders) {
			const template = await ctx.db
				.query('orderTemplates')
				.withIndex('by_slug', (q) => q.eq('slug', order.templateSlug))
				.unique();
			result.push({ ...order, title: template?.title ?? order.templateSlug });
		}
		return result;
	}
});

export const collect = mutation({
	args: { orderId: v.id('orders') },
	handler: async (ctx, { orderId }) => {
		const player = await requirePlayer(ctx);
		return await completeOrder(ctx, player, orderId, 'worker');
	}
});

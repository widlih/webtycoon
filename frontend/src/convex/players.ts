import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { energyState, refillEnergy } from './model/energy';
import { ensurePlayer, getPlayer, requirePlayer } from './model/players';

export const me = query({
	args: {},
	handler: async (ctx) => {
		const player = await getPlayer(ctx);
		if (!player) return null;
		const energy = energyState(player, Date.now());
		return {
			...player,
			premium: player.premium ?? 0,
			energy: energy.energy,
			energyMax: energy.max,
			energyNextInMs: energy.nextInMs
		};
	}
});

export const ensure = mutation({
	args: { ref: v.optional(v.string()) },
	handler: async (ctx, { ref }) => ensurePlayer(ctx, ref)
});

export const refill = mutation({
	args: {},
	handler: async (ctx) => {
		const player = await requirePlayer(ctx);
		await refillEnergy(ctx, player);
	}
});

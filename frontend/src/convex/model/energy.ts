import type { Doc } from '../_generated/dataModel';
import type { MutationCtx } from '../_generated/server';
import { ENERGY_MAX, ENERGY_REFILL_PREMIUM, ENERGY_REGEN_MS } from './constants';
import { spend } from './ledger';

export type EnergyState = { energy: number; max: number; updatedAt: number; nextInMs: number };

export function energyState(player: Doc<'players'>, now: number): EnergyState {
	const stored = player.energy ?? ENERGY_MAX;
	const updatedAt = player.energyUpdatedAt ?? now;
	if (stored >= ENERGY_MAX)
		return { energy: ENERGY_MAX, max: ENERGY_MAX, updatedAt: now, nextInMs: 0 };
	const gained = Math.floor((now - updatedAt) / ENERGY_REGEN_MS);
	const energy = Math.min(ENERGY_MAX, stored + gained);
	if (energy >= ENERGY_MAX)
		return { energy: ENERGY_MAX, max: ENERGY_MAX, updatedAt: now, nextInMs: 0 };
	const advancedAt = updatedAt + gained * ENERGY_REGEN_MS;
	return {
		energy,
		max: ENERGY_MAX,
		updatedAt: advancedAt,
		nextInMs: advancedAt + ENERGY_REGEN_MS - now
	};
}

export async function spendEnergy(ctx: MutationCtx, player: Doc<'players'>, amount: number) {
	const now = Date.now();
	const state = energyState(player, now);
	if (state.energy < amount) throw new Error('NOT_ENOUGH_ENERGY');
	await ctx.db.patch(player._id, {
		energy: state.energy - amount,
		energyUpdatedAt: state.energy >= ENERGY_MAX ? now : state.updatedAt
	});
}

export async function refillEnergy(ctx: MutationCtx, player: Doc<'players'>) {
	const now = Date.now();
	if (energyState(player, now).energy >= ENERGY_MAX) throw new Error('ENERGY_FULL');
	await spend(ctx, {
		playerId: player._id,
		currency: 'premium',
		amount: ENERGY_REFILL_PREMIUM,
		reason: 'energy.refill',
		key: `energy:${player._id}:${now}`
	});
	await ctx.db.patch(player._id, { energy: ENERGY_MAX, energyUpdatedAt: now });
}

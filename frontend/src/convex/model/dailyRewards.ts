import type { Doc } from '../_generated/dataModel';
import type { MutationCtx } from '../_generated/server';
import { DAILY_CYCLE, DAILY_REWARDS } from '../content/dailyRewards';
import { grantBoxes } from './boxes';
import { ENERGY_MAX, periodKey } from './constants';
import { emit } from './events';
import { grantReward } from './ledger';
import { nextDailyReset } from './quests';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Состояние ежедневной награды. Серия продолжается, если предыдущая награда
 * забрана вчера; пропуск дня начинает отсчёт заново с первого дня.
 */
export function dailyState(player: Doc<'players'>, now = Date.now()) {
	const today = periodKey(now);
	const yesterday = periodKey(now - DAY_MS);
	const last = player.lastDailyClaim;
	const streak = player.dailyStreak ?? 0;
	const claimedToday = last === today;
	const nextStreak = claimedToday ? streak : last === yesterday ? streak + 1 : 1;
	const day = ((Math.max(1, nextStreak) - 1) % DAILY_CYCLE) + 1;
	return {
		claimedToday,
		/** Длина серии с учётом сегодняшнего дня */
		streak: nextStreak,
		/** Номер дня в цикле 1..7, за который выдаётся (или уже выдана) сегодняшняя награда */
		day,
		rewards: DAILY_REWARDS,
		resetsAt: nextDailyReset(now)
	};
}

export async function claimDaily(ctx: MutationCtx, player: Doc<'players'>) {
	const now = Date.now();
	const state = dailyState(player, now);
	if (state.claimedToday) throw new Error('DAILY_ALREADY_CLAIMED');
	const reward = DAILY_REWARDS[state.day - 1];
	const today = periodKey(now);

	await ctx.db.patch(player._id, { dailyStreak: state.streak, lastDailyClaim: today });
	await grantReward(
		ctx,
		player._id,
		{ coins: reward.coins, xp: reward.xp, premium: reward.premium },
		'daily.reward',
		`daily:${player._id}:${today}`,
		{ refType: 'daily', refId: today }
	);
	if (reward.boxes) await grantBoxes(ctx, player._id, reward.boxes);
	if (reward.energy === 'full')
		await ctx.db.patch(player._id, { energy: ENERGY_MAX, energyUpdatedAt: now });
	await emit(ctx, player._id, { type: 'daily.claimed', day: state.day, streak: state.streak });
	return { day: state.day, streak: state.streak, reward };
}

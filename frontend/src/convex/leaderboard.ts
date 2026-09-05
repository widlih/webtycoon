import { v } from 'convex/values';
import { internalMutation, query } from './_generated/server';
import {
	BOARDS,
	LEADERBOARD_PRIZES,
	periodKey,
	periodKeyFor,
	type BoardPeriod
} from './model/constants';
import { grantBoxes } from './model/boxes';
import { grantReward } from './model/ledger';
import { closePeriod, myScore, top } from './model/leaderboard';
import { nextDailyReset, nextMonthlyReset, nextWeeklyReset } from './model/quests';
import { requirePlayer } from './model/players';

const boardPeriod = v.union(v.literal('day'), v.literal('week'), v.literal('month'));

export const board = query({
	args: { period: boardPeriod },
	handler: async (ctx, { period }) => {
		const player = await requirePlayer(ctx);
		const key = periodKeyFor(period as BoardPeriod, Date.now());
		const boardName = BOARDS[period as BoardPeriod];
		const rows = await top(ctx, boardName, key);
		const now = Date.now();
		const resetsAt =
			period === 'day'
				? nextDailyReset(now)
				: period === 'week'
					? nextWeeklyReset(now)
					: nextMonthlyReset(now);
		const prizes = LEADERBOARD_PRIZES[period].map((prize, i) => ({ rank: i + 1, ...prize }));
		return {
			period,
			key,
			rows,
			me: await myScore(ctx, boardName, key, player._id),
			playerId: player._id,
			resetsAt,
			prizes
		};
	}
});

async function closeOne(ctx: Parameters<typeof closePeriod>[0], period: BoardPeriod, key: string) {
	const { winners, fresh } = await closePeriod(ctx, period, key);
	const prizes = LEADERBOARD_PRIZES[period];
	let rewarded = 0;
	for (const row of winners) {
		const prize = prizes[row.rank - 1];
		if (!prize) break;
		await grantReward(
			ctx,
			row.playerId,
			{ coins: prize.coins, premium: prize.premium },
			'leaderboard.prize',
			`${period}:${key}:${row.rank}:${row.playerId}`,
			{ refType: 'daySnapshot', refId: `${period}:${key}` }
		);
		if (fresh && prize.boxes > 0) await grantBoxes(ctx, row.playerId, prize.boxes);
		rewarded++;
	}
	return { period, key, rewarded, fresh };
}

const HOUR_MS = 60 * 60 * 1000;

/** Закрывает один период вручную. Без аргументов — вчерашний день. */
export const close = internalMutation({
	args: { period: v.optional(boardPeriod), key: v.optional(v.string()) },
	handler: async (ctx, args) => {
		const period = (args.period ?? 'day') as BoardPeriod;
		const key = args.key ?? periodKeyFor(period, Date.now() - HOUR_MS);
		return await closeOne(ctx, period, key);
	}
});

/**
 * Запускается кроном в полночь по игровому времени: всегда закрывает прошедший день,
 * а неделю и месяц — только если за последний час сменился их ключ.
 */
export const closePeriods = internalMutation({
	args: {},
	handler: async (ctx) => {
		const now = Date.now();
		const before = now - HOUR_MS;
		const results = [await closeOne(ctx, 'day', periodKey(before))];
		for (const period of ['week', 'month'] as const) {
			const closing = periodKeyFor(period, before);
			if (closing === periodKeyFor(period, now)) continue;
			results.push(await closeOne(ctx, period, closing));
		}
		return results;
	}
});

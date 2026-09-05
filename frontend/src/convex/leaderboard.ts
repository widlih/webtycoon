import { v } from 'convex/values';
import { internalMutation, query } from './_generated/server';
import {
	BOARDS,
	DAILY_PREMIUM_PRIZES,
	DAILY_PRIZES,
	periodKey,
	periodKeyFor,
	type BoardPeriod
} from './model/constants';
import { grantReward } from './model/ledger';
import { closeDay, myScore, top } from './model/leaderboard';
import { requirePlayer } from './model/players';

export const board = query({
	args: { period: v.union(v.literal('day'), v.literal('week'), v.literal('month')) },
	handler: async (ctx, { period }) => {
		const player = await requirePlayer(ctx);
		const key = periodKeyFor(period as BoardPeriod, Date.now());
		const boardName = BOARDS[period as BoardPeriod];
		const rows = await top(ctx, boardName, key);
		return {
			period,
			key,
			rows,
			me: await myScore(ctx, boardName, key, player._id),
			playerId: player._id
		};
	}
});

export const close = internalMutation({
	args: { period: v.optional(v.string()) },
	handler: async (ctx, args) => {
		const period = args.period ?? periodKey(Date.now() - 24 * 60 * 60 * 1000);
		const winners = await closeDay(ctx, period);
		let rewarded = 0;
		for (const row of winners) {
			const coins = DAILY_PRIZES[row.rank - 1];
			const premium = DAILY_PREMIUM_PRIZES[row.rank - 1];
			if (!coins && !premium) break;
			await grantReward(
				ctx,
				row.playerId,
				{ coins, premium },
				'leaderboard.prize',
				`day:${period}:${row.rank}:${row.playerId}`,
				{ refType: 'daySnapshot', refId: period }
			);
			rewarded++;
		}
		return { period, rewarded };
	}
});

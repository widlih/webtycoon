import type { Id } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import { BOARDS, LEADERBOARD_SIZE, periodKeyFor, type BoardPeriod } from './constants';
import type { EventHandler } from './events';

export const onEvent: EventHandler = async () => {};

export async function addScore(ctx: MutationCtx, playerId: Id<'players'>, xp: number) {
	const now = Date.now();
	for (const period of Object.keys(BOARDS) as BoardPeriod[]) {
		const board = BOARDS[period];
		const key = periodKeyFor(period, now);
		const existing = await ctx.db
			.query('scores')
			.withIndex('by_board_period_player', (q) =>
				q.eq('board', board).eq('periodKey', key).eq('playerId', playerId)
			)
			.unique();
		if (existing) await ctx.db.patch(existing._id, { score: existing.score + xp, updatedAt: now });
		else
			await ctx.db.insert('scores', { board, periodKey: key, playerId, score: xp, updatedAt: now });
	}
}

export async function top(
	ctx: QueryCtx | MutationCtx,
	board: string,
	period: string,
	limit = LEADERBOARD_SIZE
) {
	const rows = await ctx.db
		.query('scores')
		.withIndex('by_board_period_score', (q) => q.eq('board', board).eq('periodKey', period))
		.order('desc')
		.take(limit);
	const result = [];
	for (const [index, row] of rows.entries()) {
		const player = await ctx.db.get(row.playerId);
		result.push({
			rank: index + 1,
			playerId: row.playerId,
			nick: player?.nick ?? '',
			level: player?.level ?? 1,
			score: row.score
		});
	}
	return result;
}

export async function myScore(
	ctx: QueryCtx | MutationCtx,
	board: string,
	period: string,
	playerId: Id<'players'>
) {
	const mine = await ctx.db
		.query('scores')
		.withIndex('by_board_period_player', (q) =>
			q.eq('board', board).eq('periodKey', period).eq('playerId', playerId)
		)
		.unique();
	if (!mine) return null;
	const above = await ctx.db
		.query('scores')
		.withIndex('by_board_period_score', (q) =>
			q.eq('board', board).eq('periodKey', period).gt('score', mine.score)
		)
		.collect();
	return { rank: above.length + 1, score: mine.score };
}

export async function closeDay(ctx: MutationCtx, period: string) {
	const existing = await ctx.db
		.query('daySnapshots')
		.withIndex('by_board_period', (q) => q.eq('board', BOARDS.day).eq('periodKey', period))
		.unique();
	if (existing) return existing.top as Awaited<ReturnType<typeof top>>;
	const winners = await top(ctx, BOARDS.day, period);
	await ctx.db.insert('daySnapshots', {
		board: BOARDS.day,
		periodKey: period,
		closedAt: Date.now(),
		top: winners
	});
	return winners;
}

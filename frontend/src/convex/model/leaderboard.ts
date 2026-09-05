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

async function ranking(ctx: QueryCtx | MutationCtx, board: string, period: string) {
	const rows = await ctx.db
		.query('scores')
		.withIndex('by_board_period_score', (q) => q.eq('board', board).eq('periodKey', period))
		.order('desc')
		.collect();
	const scored = new Set(rows.map((row) => row.playerId));
	const idle = (await ctx.db.query('players').collect())
		.filter((player) => !scored.has(player._id))
		.sort((a, b) => b.createdAt - a.createdAt);
	const result = [];
	for (const row of rows) {
		const player = await ctx.db.get(row.playerId);
		result.push({
			playerId: row.playerId,
			nick: player?.nick ?? '',
			level: player?.level ?? 1,
			score: row.score
		});
	}
	for (const player of idle)
		result.push({ playerId: player._id, nick: player.nick, level: player.level, score: 0 });
	return result.map((row, index) => ({ rank: index + 1, ...row }));
}

export async function top(
	ctx: QueryCtx | MutationCtx,
	board: string,
	period: string,
	limit = LEADERBOARD_SIZE
) {
	return (await ranking(ctx, board, period)).slice(0, limit);
}

export async function myScore(
	ctx: QueryCtx | MutationCtx,
	board: string,
	period: string,
	playerId: Id<'players'>
) {
	const me = (await ranking(ctx, board, period)).find((row) => row.playerId === playerId);
	return me ? { rank: me.rank, score: me.score } : null;
}

export type Winners = Awaited<ReturnType<typeof top>>;

/** Фиксирует итоги периода в снапшоте. Повторный вызов возвращает уже сохранённый список. */
export async function closePeriod(
	ctx: MutationCtx,
	period: BoardPeriod,
	key: string
): Promise<{ winners: Winners; fresh: boolean }> {
	const board = BOARDS[period];
	const existing = await ctx.db
		.query('daySnapshots')
		.withIndex('by_board_period', (q) => q.eq('board', board).eq('periodKey', key))
		.unique();
	if (existing) return { winners: existing.top as Winners, fresh: false };
	const winners = (await top(ctx, board, key)).filter((row) => row.score > 0);
	await ctx.db.insert('daySnapshots', {
		board,
		periodKey: key,
		closedAt: Date.now(),
		top: winners
	});
	return { winners, fresh: true };
}

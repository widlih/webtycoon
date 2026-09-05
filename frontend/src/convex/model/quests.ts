import type { Doc, Id } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import { TIMEZONE_OFFSET_MS, periodKey, weekKey } from './constants';
import type { EventHandler } from './events';
import { grantReward } from './ledger';

type Rule = { event?: string; count?: number; source?: string; action?: string };

function periodOf(quest: Doc<'quests'>, now: number): string {
	if (quest.period === 'daily') return periodKey(now);
	if (quest.period === 'weekly') return weekKey(now);
	return 'once';
}

export function nextDailyReset(now: number): number {
	const d = new Date(now + TIMEZONE_OFFSET_MS);
	d.setUTCHours(24, 0, 0, 0);
	return d.getTime() - TIMEZONE_OFFSET_MS;
}

export function nextWeeklyReset(now: number): number {
	const d = new Date(now + TIMEZONE_OFFSET_MS);
	const day = (d.getUTCDay() + 6) % 7;
	d.setUTCDate(d.getUTCDate() + (7 - day));
	d.setUTCHours(0, 0, 0, 0);
	return d.getTime() - TIMEZONE_OFFSET_MS;
}

async function progressDoc(
	ctx: QueryCtx | MutationCtx,
	playerId: Id<'players'>,
	questSlug: string,
	period: string
) {
	return await ctx.db
		.query('questProgress')
		.withIndex('by_player_quest_period', (q) =>
			q.eq('playerId', playerId).eq('questSlug', questSlug).eq('periodKey', period)
		)
		.unique();
}

export const onEvent: EventHandler = async (ctx, playerId, event) => {
	const now = Date.now();
	const quests = (await ctx.db.query('quests').collect()).filter(
		(q) => q.active && q.kind === 'ingame'
	);
	for (const quest of quests) {
		const rule = quest.rule as Rule;
		if (rule.event !== event.type) continue;
		const target = rule.count ?? 1;
		const period = periodOf(quest, now);
		const existing = await progressDoc(ctx, playerId, quest.slug, period);
		if (existing?.completedAt) continue;
		const progress = (existing?.progress ?? 0) + 1;
		const completedAt = progress >= target ? now : undefined;
		if (existing) await ctx.db.patch(existing._id, { progress, completedAt });
		else
			await ctx.db.insert('questProgress', {
				playerId,
				questSlug: quest.slug,
				periodKey: period,
				progress,
				completedAt
			});
	}
};

export async function listQuests(ctx: QueryCtx | MutationCtx, playerId: Id<'players'>) {
	const now = Date.now();
	const quests = (await ctx.db.query('quests').collect())
		.filter((q) => q.active)
		.sort((a, b) => a.order - b.order);
	const result = [];
	for (const quest of quests) {
		const period = periodOf(quest, now);
		const progress = await progressDoc(ctx, playerId, quest.slug, period);
		if (progress?.claimedAt) continue;
		const rule = quest.rule as Rule;
		result.push({
			slug: quest.slug,
			title: quest.title,
			kind: quest.kind,
			period: quest.period,
			reward: quest.reward,
			target: rule.count ?? 1,
			progress: progress?.progress ?? 0,
			completed: Boolean(progress?.completedAt),
			claimed: false
		});
	}
	return { quests: result, resets: { daily: nextDailyReset(now), weekly: nextWeeklyReset(now) } };
}

export async function claimQuest(ctx: MutationCtx, player: Doc<'players'>, slug: string) {
	const quest = await ctx.db
		.query('quests')
		.withIndex('by_slug', (q) => q.eq('slug', slug))
		.unique();
	if (!quest || !quest.active) throw new Error('QUEST_NOT_FOUND');
	const period = periodOf(quest, Date.now());
	const progress = await progressDoc(ctx, player._id, slug, period);
	if (!progress?.completedAt) throw new Error('QUEST_NOT_COMPLETED');
	if (progress.claimedAt) throw new Error('ALREADY_CLAIMED');
	await ctx.db.patch(progress._id, { claimedAt: Date.now() });
	await grantReward(
		ctx,
		player._id,
		quest.reward,
		'quest.claim',
		`quest:${player._id}:${slug}:${period}`,
		{ refType: 'quest', refId: slug }
	);
	return quest.reward;
}

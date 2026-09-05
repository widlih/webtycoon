import type { Id } from '../_generated/dataModel';
import type { MutationCtx } from '../_generated/server';
import { onEvent as achievementsOnEvent } from './achievements';
import { onEvent as leaderboardOnEvent } from './leaderboard';
import { onEvent as questsOnEvent } from './quests';

export type GameEvent =
	| { type: 'player.created' }
	| { type: 'room.opened'; roomId: Id<'rooms'>; product: string }
	| { type: 'worker.hired'; roomId: Id<'rooms'>; product: string }
	| { type: 'item.bought'; roomId: Id<'rooms'>; slotId: string; itemSlug: string }
	| { type: 'office.bought'; tier: number }
	| {
			type: 'order.completed';
			orderId: Id<'orders'>;
			product: string;
			via: 'worker' | 'quiz';
			xp: number;
	  }
	| {
			type: 'lesson.completed';
			lessonSlug: string;
			product: string;
			skillLevel: number;
			xp: number;
	  }
	| { type: 'quiz.passed'; product: string; correct: number }
	| { type: 'coupon.bought'; templateSlug: string; product: string }
	| { type: 'quest.claimed'; questSlug: string }
	| { type: 'external.action'; source: string; action: string };

export type EventHandler = (
	ctx: MutationCtx,
	playerId: Id<'players'>,
	event: GameEvent
) => Promise<void>;

const handlers: EventHandler[] = [questsOnEvent, leaderboardOnEvent, achievementsOnEvent];

export async function emit(
	ctx: MutationCtx,
	playerId: Id<'players'>,
	event: GameEvent
): Promise<void> {
	const { type, ...payload } = event;
	await ctx.db.insert('events', { playerId, type, payload, createdAt: Date.now() });
	for (const handler of handlers) await handler(ctx, playerId, event);
}

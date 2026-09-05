import type { Id } from '../_generated/dataModel';
import type { MutationCtx } from '../_generated/server';
import { onEvent as achievementsOnEvent } from './achievements';
import { onEvent as leaderboardOnEvent } from './leaderboard';
import { onEvent as questsOnEvent } from './quests';
import { onEvent as referralsOnEvent } from './referrals';

export type GameEvent =
	| { type: 'player.created' }
	| { type: 'room.opened'; roomId: Id<'rooms'> }
	| { type: 'worker.hired'; roomId: Id<'rooms'> }
	| { type: 'worker.left'; roomId: Id<'rooms'>; workerSlug: string }
	| { type: 'item.bought'; itemSlug: string }
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
	| { type: 'box.opened'; dropId: string }
	| { type: 'daily.claimed'; day: number; streak: number }
	| { type: 'external.action'; source: string; action: string }
	| { type: 'referral.completed'; referredId: Id<'players'> };

export type EventHandler = (
	ctx: MutationCtx,
	playerId: Id<'players'>,
	event: GameEvent
) => Promise<void>;

export async function emit(
	ctx: MutationCtx,
	playerId: Id<'players'>,
	event: GameEvent
): Promise<void> {
	const { type, ...payload } = event;
	await ctx.db.insert('events', { playerId, type, payload, createdAt: Date.now() });
	const handlers: EventHandler[] = [
		questsOnEvent,
		leaderboardOnEvent,
		achievementsOnEvent,
		referralsOnEvent
	];
	for (const handler of handlers) await handler(ctx, playerId, event);
}

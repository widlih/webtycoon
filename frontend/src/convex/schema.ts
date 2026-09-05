import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export const currency = v.union(v.literal('coins'), v.literal('premium'), v.literal('xp'));
export const orderStatus = v.union(v.literal('queued'), v.literal('active'), v.literal('done'));
export const couponStatus = v.union(
	v.literal('active'),
	v.literal('redeemed'),
	v.literal('expired')
);
export const reward = v.object({ coins: v.number(), xp: v.number() });

export default defineSchema({
	players: defineTable({
		authId: v.string(),
		nick: v.string(),
		xp: v.number(),
		level: v.number(),
		coins: v.number(),
		premium: v.optional(v.number()),
		boxes: v.optional(v.number()),
		energy: v.optional(v.number()),
		energyUpdatedAt: v.optional(v.number()),
		offerSlotsUnlocked: v.optional(v.number()),
		activeOfficeId: v.optional(v.id('offices')),
		referralCode: v.optional(v.string()),
		referredBy: v.optional(v.id('players')),
		referralRewarded: v.optional(v.boolean()),
		telegramUserId: v.optional(v.string()),
		createdAt: v.number()
	})
		.index('by_auth', ['authId'])
		.index('by_referral_code', ['referralCode'])
		.index('by_telegram', ['telegramUserId']),

	skills: defineTable({
		playerId: v.id('players'),
		product: v.string(),
		level: v.number()
	}).index('by_player_product', ['playerId', 'product']),

	offices: defineTable({
		playerId: v.id('players'),
		tier: v.number(),
		createdAt: v.number()
	}).index('by_player', ['playerId']),

	rooms: defineTable({
		officeId: v.id('offices'),
		playerId: v.id('players'),
		q: v.number(),
		r: v.number(),
		worker: v.optional(
			v.object({
				name: v.string(),
				skin: v.string(),
				isPlayer: v.boolean(),
				slug: v.optional(v.string()),
				speed: v.optional(v.number()),
				salary: v.optional(v.number())
			})
		),
		createdAt: v.number()
	})
		.index('by_office', ['officeId'])
		.index('by_player', ['playerId']),

	roomItems: defineTable({
		roomId: v.id('rooms'),
		slotId: v.string(),
		itemSlug: v.string()
	})
		.index('by_room', ['roomId'])
		.index('by_room_slot', ['roomId', 'slotId']),

	inventory: defineTable({
		playerId: v.id('players'),
		kind: v.union(v.literal('item'), v.literal('worker')),
		slug: v.string(),
		createdAt: v.number()
	}).index('by_player', ['playerId']),

	payrolls: defineTable({
		playerId: v.id('players'),
		periodKey: v.string(),
		paid: v.number(),
		total: v.number(),
		left: v.array(v.string()),
		createdAt: v.number()
	}).index('by_player', ['playerId']),

	orderTemplates: defineTable({
		slug: v.string(),
		product: v.string(),
		title: v.string(),
		minSkill: v.number(),
		durationMin: v.number(),
		reward,
		active: v.boolean()
	})
		.index('by_slug', ['slug'])
		.index('by_product', ['product']),

	offerSlots: defineTable({
		playerId: v.id('players'),
		index: v.number(),
		templateSlug: v.optional(v.string()),
		product: v.optional(v.string()),
		readyAt: v.optional(v.number()),
		swapped: v.optional(v.boolean())
	}).index('by_player', ['playerId']),

	orders: defineTable({
		playerId: v.id('players'),
		roomId: v.optional(v.id('rooms')),
		product: v.string(),
		templateSlug: v.string(),
		status: orderStatus,
		startedAt: v.optional(v.number()),
		endsAt: v.optional(v.number()),
		completedAt: v.optional(v.number()),
		reward
	})
		.index('by_player_status', ['playerId', 'status'])
		.index('by_room', ['roomId']),

	ledger: defineTable({
		playerId: v.id('players'),
		currency,
		delta: v.number(),
		balanceAfter: v.number(),
		reason: v.string(),
		refType: v.optional(v.string()),
		refId: v.optional(v.string()),
		key: v.string(),
		createdAt: v.number()
	})
		.index('by_player', ['playerId'])
		.index('by_key', ['key']),

	events: defineTable({
		playerId: v.id('players'),
		type: v.string(),
		payload: v.any(),
		createdAt: v.number()
	}).index('by_player', ['playerId']),

	externalEvents: defineTable({
		source: v.string(),
		externalId: v.string(),
		type: v.string(),
		playerRef: v.string(),
		payload: v.any(),
		receivedAt: v.number(),
		processedAt: v.optional(v.number())
	}).index('by_source_external', ['source', 'externalId']),

	lessons: defineTable({
		slug: v.string(),
		product: v.string(),
		order: v.number(),
		title: v.string(),
		steps: v.any(),
		reward,
		active: v.boolean()
	})
		.index('by_slug', ['slug'])
		.index('by_product', ['product']),

	lessonProgress: defineTable({
		playerId: v.id('players'),
		lessonSlug: v.string(),
		completedAt: v.number()
	}).index('by_player_lesson', ['playerId', 'lessonSlug']),

	quizQuestions: defineTable({
		product: v.string(),
		question: v.string(),
		options: v.array(v.string()),
		answer: v.number(),
		active: v.boolean()
	}).index('by_product', ['product']),

	quests: defineTable({
		slug: v.string(),
		title: v.string(),
		kind: v.string(),
		rule: v.any(),
		reward,
		period: v.string(),
		active: v.boolean(),
		order: v.number()
	}).index('by_slug', ['slug']),

	questProgress: defineTable({
		playerId: v.id('players'),
		questSlug: v.string(),
		periodKey: v.string(),
		progress: v.number(),
		startedAt: v.optional(v.number()),
		completedAt: v.optional(v.number()),
		claimedAt: v.optional(v.number())
	})
		.index('by_player_period', ['playerId', 'periodKey'])
		.index('by_player_quest_period', ['playerId', 'questSlug', 'periodKey']),

	items: defineTable({
		slug: v.string(),
		name: v.string(),
		price: v.number(),
		effect: v.any(),
		unlockLevel: v.number()
	}).index('by_slug', ['slug']),

	workers: defineTable({
		slug: v.string(),
		name: v.string(),
		skin: v.string(),
		speed: v.number(),
		price: v.number(),
		salary: v.optional(v.number()),
		order: v.number(),
		active: v.boolean()
	}).index('by_slug', ['slug']),

	boosts: defineTable({
		slug: v.string(),
		title: v.string(),
		description: v.string(),
		kind: v.union(
			v.literal('energy'),
			v.literal('overtime'),
			v.literal('freelancer'),
			v.literal('bonus')
		),
		value: v.number(),
		durationMin: v.optional(v.number()),
		price: v.number(),
		order: v.number(),
		active: v.boolean()
	}).index('by_slug', ['slug']),

	playerBoosts: defineTable({
		playerId: v.id('players'),
		kind: v.string(),
		expiresAt: v.optional(v.number()),
		createdAt: v.number()
	}).index('by_player_kind', ['playerId', 'kind']),

	couponTemplates: defineTable({
		slug: v.string(),
		product: v.string(),
		title: v.string(),
		discount: v.string(),
		price: v.number(),
		ttlDays: v.number()
	}).index('by_slug', ['slug']),

	coupons: defineTable({
		playerId: v.id('players'),
		templateSlug: v.string(),
		code: v.string(),
		status: couponStatus,
		issuedAt: v.number(),
		expiresAt: v.number(),
		redeemedAt: v.optional(v.number())
	})
		.index('by_player', ['playerId'])
		.index('by_code', ['code']),

	boxOpens: defineTable({
		playerId: v.id('players'),
		periodKey: v.string(),
		dropId: v.string(),
		prize: v.any(),
		source: v.optional(v.union(v.literal('buy'), v.literal('reward'))),
		createdAt: v.number()
	}).index('by_player_period', ['playerId', 'periodKey']),

	scores: defineTable({
		board: v.string(),
		periodKey: v.string(),
		playerId: v.id('players'),
		score: v.number(),
		updatedAt: v.number()
	})
		.index('by_board_period_score', ['board', 'periodKey', 'score'])
		.index('by_board_period_player', ['board', 'periodKey', 'playerId']),

	daySnapshots: defineTable({
		board: v.string(),
		periodKey: v.string(),
		closedAt: v.number(),
		top: v.any()
	}).index('by_board_period', ['board', 'periodKey']),

	quizRuns: defineTable({
		playerId: v.id('players'),
		orderId: v.id('orders'),
		product: v.string(),
		questionIds: v.array(v.id('quizQuestions')),
		status: v.union(v.literal('open'), v.literal('passed'), v.literal('failed')),
		correct: v.optional(v.number()),
		createdAt: v.number()
	})
		.index('by_player', ['playerId'])
		.index('by_order', ['orderId']),

	buildRuns: defineTable({
		playerId: v.id('players'),
		orderId: v.id('orders'),
		product: v.string(),
		kind: v.optional(v.string()),
		target: v.number(),
		lines: v.optional(v.number()),
		status: v.union(v.literal('open'), v.literal('passed'), v.literal('failed')),
		createdAt: v.number()
	})
		.index('by_player', ['playerId'])
		.index('by_order', ['orderId']),

	achievements: defineTable({
		slug: v.string(),
		title: v.string(),
		description: v.string(),
		rule: v.any(),
		reward: v.object({ premium: v.number() }),
		order: v.number(),
		active: v.boolean()
	}).index('by_slug', ['slug']),

	achievementProgress: defineTable({
		playerId: v.id('players'),
		slug: v.string(),
		progress: v.number(),
		unlockedAt: v.optional(v.number())
	}).index('by_player_slug', ['playerId', 'slug']),

	leads: defineTable({
		playerId: v.id('players'),
		kind: v.string(),
		email: v.string(),
		createdAt: v.number()
	}).index('by_player_kind', ['playerId', 'kind']),

	config: defineTable({
		key: v.string(),
		value: v.any()
	}).index('by_key', ['key'])
});

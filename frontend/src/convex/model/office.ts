import type { Doc, Id } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import { OFFICE_TIERS, PRODUCTS, ROOM_SLOTS, roomPrice, type Product } from './constants';
import { emit } from './events';
import { hexDistance, hexKey, hexesWithinRadius, neighbors, radiusForCapacity } from './hex';
import { spend } from './ledger';
import { raiseSkill } from './skills';

type Ctx = QueryCtx | MutationCtx;

export function tierInfo(tier: number) {
	const info = OFFICE_TIERS.find((t) => t.tier === tier);
	if (!info) throw new Error('UNKNOWN_TIER');
	return info;
}

export function slotsForTier(tier: number) {
	return ROOM_SLOTS.slice(0, tierInfo(tier).slotsPerRoom);
}

export async function officeOf(ctx: Ctx, player: Doc<'players'>) {
	const active = player.activeOfficeId ? await ctx.db.get(player.activeOfficeId) : null;
	if (active) return active;
	return await ctx.db
		.query('offices')
		.withIndex('by_player', (q) => q.eq('playerId', player._id))
		.first();
}

export async function roomsOf(ctx: Ctx, officeId: Id<'offices'>) {
	return await ctx.db
		.query('rooms')
		.withIndex('by_office', (q) => q.eq('officeId', officeId))
		.collect();
}

export async function itemsOfRoom(ctx: Ctx, roomId: Id<'rooms'>) {
	return await ctx.db
		.query('roomItems')
		.withIndex('by_room', (q) => q.eq('roomId', roomId))
		.collect();
}

export async function requireOwnRoom(ctx: Ctx, player: Doc<'players'>, roomId: Id<'rooms'>) {
	const room = await ctx.db.get(roomId);
	if (!room || room.playerId !== player._id) throw new Error('ROOM_NOT_FOUND');
	return room;
}

export async function bootstrapOffice(ctx: MutationCtx, player: Doc<'players'>) {
	const officeId = await ctx.db.insert('offices', {
		playerId: player._id,
		tier: 1,
		createdAt: Date.now()
	});
	await ctx.db.insert('rooms', {
		officeId,
		playerId: player._id,
		product: 'rusender',
		q: 0,
		r: 0,
		worker: { name: player.nick, skin: 'player', isPlayer: true, speed: 0 },
		createdAt: Date.now()
	});
	await raiseSkill(ctx, player._id, 'rusender', 1);
	await ctx.db.patch(player._id, { activeOfficeId: officeId });
	return officeId;
}

export async function availableHexes(ctx: Ctx, office: Doc<'offices'>) {
	const rooms = await roomsOf(ctx, office._id);
	const occupied = new Set(rooms.map((room) => hexKey(room.q, room.r)));
	const radius = radiusForCapacity(tierInfo(office.tier).hexCapacity);
	const price = roomPrice(rooms.length + 1);
	const result: Array<{ q: number; r: number; price: number }> = [];
	for (const hex of hexesWithinRadius(radius)) {
		if (occupied.has(hexKey(hex.q, hex.r))) continue;
		if (neighbors(hex.q, hex.r).some((n) => occupied.has(hexKey(n.q, n.r))))
			result.push({ ...hex, price });
	}
	return result;
}

export async function openRoom(
	ctx: MutationCtx,
	player: Doc<'players'>,
	q: number,
	r: number,
	product: string
) {
	const office = await officeOf(ctx, player);
	if (!office) throw new Error('OFFICE_NOT_FOUND');
	if (!PRODUCTS.includes(product as Product)) throw new Error('UNKNOWN_PRODUCT');
	const rooms = await roomsOf(ctx, office._id);
	const capacity = tierInfo(office.tier).hexCapacity;
	if (rooms.length >= capacity) throw new Error('OFFICE_FULL');
	if (hexDistance(q, r) > radiusForCapacity(capacity)) throw new Error('OUT_OF_BOUNDS');
	const occupied = new Set(rooms.map((room) => hexKey(room.q, room.r)));
	if (occupied.has(hexKey(q, r))) throw new Error('HEX_OCCUPIED');
	if (!neighbors(q, r).some((n) => occupied.has(hexKey(n.q, n.r)))) throw new Error('NOT_ADJACENT');
	await spend(ctx, {
		playerId: player._id,
		currency: 'coins',
		amount: roomPrice(rooms.length + 1),
		reason: 'room.open',
		key: `room:${office._id}:${q},${r}`
	});
	const roomId = await ctx.db.insert('rooms', {
		officeId: office._id,
		playerId: player._id,
		product,
		q,
		r,
		createdAt: Date.now()
	});
	await raiseSkill(ctx, player._id, product, 1);
	await emit(ctx, player._id, { type: 'room.opened', roomId, product });
	return roomId;
}

export async function hiredSlugs(ctx: Ctx, playerId: Id<'players'>) {
	const rooms = await ctx.db
		.query('rooms')
		.withIndex('by_player', (q) => q.eq('playerId', playerId))
		.collect();
	return new Set(rooms.map((r) => r.worker?.slug).filter((s): s is string => Boolean(s)));
}

export async function hireWorker(
	ctx: MutationCtx,
	player: Doc<'players'>,
	roomId: Id<'rooms'>,
	workerSlug: string
) {
	const room = await requireOwnRoom(ctx, player, roomId);
	if (room.worker) throw new Error('ROOM_HAS_WORKER');
	const worker = await ctx.db
		.query('workers')
		.withIndex('by_slug', (q) => q.eq('slug', workerSlug))
		.unique();
	if (!worker || !worker.active) throw new Error('WORKER_NOT_FOUND');
	if ((await hiredSlugs(ctx, player._id)).has(workerSlug)) throw new Error('WORKER_ALREADY_HIRED');
	await spend(ctx, {
		playerId: player._id,
		currency: 'coins',
		amount: worker.price,
		reason: 'worker.hire',
		key: `hire:${player._id}:${workerSlug}`
	});
	await ctx.db.patch(roomId, {
		worker: {
			name: worker.name,
			skin: worker.skin,
			isPlayer: false,
			slug: worker.slug,
			speed: worker.speed
		}
	});
	await emit(ctx, player._id, { type: 'worker.hired', roomId, product: room.product });
}

export async function buyItem(
	ctx: MutationCtx,
	player: Doc<'players'>,
	roomId: Id<'rooms'>,
	slotId: string,
	itemSlug: string
) {
	const room = await requireOwnRoom(ctx, player, roomId);
	const office = await ctx.db.get(room.officeId);
	if (!office) throw new Error('OFFICE_NOT_FOUND');
	if (!slotsForTier(office.tier).some((s) => s.id === slotId)) throw new Error('SLOT_UNAVAILABLE');
	const item = await ctx.db
		.query('items')
		.withIndex('by_slug', (q) => q.eq('slug', itemSlug))
		.unique();
	if (!item) throw new Error('ITEM_NOT_FOUND');
	if (item.unlockLevel > player.level) throw new Error('LEVEL_TOO_LOW');
	const current = await ctx.db
		.query('roomItems')
		.withIndex('by_room_slot', (q) => q.eq('roomId', roomId).eq('slotId', slotId))
		.unique();
	if (current) throw new Error('SLOT_OCCUPIED');
	await spend(ctx, {
		playerId: player._id,
		currency: 'coins',
		amount: item.price,
		reason: 'item.buy',
		key: `item:${roomId}:${slotId}:${itemSlug}:${Date.now()}`
	});
	await ctx.db.insert('roomItems', { roomId, slotId, itemSlug });
	await emit(ctx, player._id, { type: 'item.bought', roomId, slotId, itemSlug });
}

export async function upgradeOffice(ctx: MutationCtx, player: Doc<'players'>, tier: number) {
	const office = await officeOf(ctx, player);
	if (!office) throw new Error('OFFICE_NOT_FOUND');
	if (tier !== office.tier + 1) throw new Error('TIER_NOT_NEXT');
	const info = tierInfo(tier);
	await spend(ctx, {
		playerId: player._id,
		currency: 'coins',
		amount: info.price,
		reason: 'office.upgrade',
		key: `office:${office._id}:${tier}`
	});
	await ctx.db.patch(office._id, { tier });
	await emit(ctx, player._id, { type: 'office.bought', tier });
}

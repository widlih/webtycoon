import type { Doc, Id } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import { OFFICE_TIERS, PRODUCTS, ROOM_SLOTS, periodKey, roomPrice } from './constants';
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

export async function inventoryOf(ctx: Ctx, playerId: Id<'players'>) {
	return await ctx.db
		.query('inventory')
		.withIndex('by_player', (q) => q.eq('playerId', playerId))
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
		q: 0,
		r: 0,
		worker: { name: player.nick, skin: 'player', isPlayer: true, speed: 0 },
		createdAt: Date.now()
	});
	for (const product of PRODUCTS) await raiseSkill(ctx, player._id, product, 1);
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

export async function openRoom(ctx: MutationCtx, player: Doc<'players'>, q: number, r: number) {
	const office = await officeOf(ctx, player);
	if (!office) throw new Error('OFFICE_NOT_FOUND');
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
		q,
		r,
		createdAt: Date.now()
	});
	await emit(ctx, player._id, { type: 'room.opened', roomId });
	return roomId;
}

export async function hiredSlugs(ctx: Ctx, playerId: Id<'players'>) {
	const rooms = await ctx.db
		.query('rooms')
		.withIndex('by_player', (q) => q.eq('playerId', playerId))
		.collect();
	const slugs = new Set(rooms.map((r) => r.worker?.slug).filter((s): s is string => Boolean(s)));
	for (const entry of await inventoryOf(ctx, playerId))
		if (entry.kind === 'worker') slugs.add(entry.slug);
	return slugs;
}

async function workerBySlug(ctx: Ctx, slug: string) {
	return await ctx.db
		.query('workers')
		.withIndex('by_slug', (q) => q.eq('slug', slug))
		.unique();
}

export async function hireWorker(ctx: MutationCtx, player: Doc<'players'>, workerSlug: string) {
	const worker = await workerBySlug(ctx, workerSlug);
	if (!worker || !worker.active) throw new Error('WORKER_NOT_FOUND');
	if ((await hiredSlugs(ctx, player._id)).has(workerSlug)) throw new Error('WORKER_ALREADY_HIRED');
	await spend(ctx, {
		playerId: player._id,
		currency: 'coins',
		amount: worker.price,
		reason: 'worker.hire',
		key: `hire:${player._id}:${workerSlug}:${Date.now()}`
	});
	return await ctx.db.insert('inventory', {
		playerId: player._id,
		kind: 'worker',
		slug: workerSlug,
		createdAt: Date.now()
	});
}

async function placeWorker(
	ctx: MutationCtx,
	player: Doc<'players'>,
	entry: Doc<'inventory'>,
	roomId: Id<'rooms'>
) {
	const room = await requireOwnRoom(ctx, player, roomId);
	if (room.worker) throw new Error('ROOM_HAS_WORKER');
	const worker = await workerBySlug(ctx, entry.slug);
	if (!worker) throw new Error('WORKER_NOT_FOUND');
	await ctx.db.patch(roomId, {
		worker: {
			name: worker.name,
			skin: worker.skin,
			isPlayer: false,
			slug: worker.slug,
			speed: worker.speed,
			salary: worker.salary ?? 0
		}
	});
	await ctx.db.delete(entry._id);
	await emit(ctx, player._id, { type: 'worker.hired', roomId });
}

export async function buyItem(ctx: MutationCtx, player: Doc<'players'>, itemSlug: string) {
	const item = await ctx.db
		.query('items')
		.withIndex('by_slug', (q) => q.eq('slug', itemSlug))
		.unique();
	if (!item) throw new Error('ITEM_NOT_FOUND');
	if (item.unlockLevel > player.level) throw new Error('LEVEL_TOO_LOW');
	await spend(ctx, {
		playerId: player._id,
		currency: 'coins',
		amount: item.price,
		reason: 'item.buy',
		key: `item:${player._id}:${itemSlug}:${Date.now()}`
	});
	const id = await ctx.db.insert('inventory', {
		playerId: player._id,
		kind: 'item',
		slug: itemSlug,
		createdAt: Date.now()
	});
	await emit(ctx, player._id, { type: 'item.bought', itemSlug });
	return id;
}

async function placeItem(
	ctx: MutationCtx,
	player: Doc<'players'>,
	entry: Doc<'inventory'>,
	roomId: Id<'rooms'>
) {
	const room = await requireOwnRoom(ctx, player, roomId);
	const office = await ctx.db.get(room.officeId);
	if (!office) throw new Error('OFFICE_NOT_FOUND');
	const installed = await itemsOfRoom(ctx, roomId);
	const slot = slotsForTier(office.tier).find((s) => !installed.some((i) => i.slotId === s.id));
	if (!slot) throw new Error('NO_FREE_SLOT');
	await ctx.db.insert('roomItems', { roomId, slotId: slot.id, itemSlug: entry.slug });
	await ctx.db.delete(entry._id);
}

export async function placeFromInventory(
	ctx: MutationCtx,
	player: Doc<'players'>,
	inventoryId: Id<'inventory'>,
	roomId: Id<'rooms'>
) {
	const entry = await ctx.db.get(inventoryId);
	if (!entry || entry.playerId !== player._id) throw new Error('INVENTORY_NOT_FOUND');
	if (entry.kind === 'worker') await placeWorker(ctx, player, entry, roomId);
	else await placeItem(ctx, player, entry, roomId);
}

export async function payroll(ctx: MutationCtx) {
	const period = periodKey(Date.now());
	const reports = new Map<
		string,
		{ playerId: Id<'players'>; paid: number; total: number; left: string[] }
	>();
	for (const room of await ctx.db.query('rooms').collect()) {
		const worker = room.worker;
		if (!worker || worker.isPlayer || !worker.slug) continue;
		let salary = worker.salary;
		if (salary === undefined) {
			const catalog = await ctx.db
				.query('workers')
				.withIndex('by_slug', (q) => q.eq('slug', worker.slug!))
				.unique();
			salary = catalog?.salary ?? 0;
		}
		if (salary <= 0) continue;
		const report = reports.get(room.playerId) ?? {
			playerId: room.playerId,
			paid: 0,
			total: 0,
			left: []
		};
		report.total += salary;
		try {
			await spend(ctx, {
				playerId: room.playerId,
				currency: 'coins',
				amount: salary,
				reason: 'worker.salary',
				key: `salary:${room._id}:${period}`
			});
			report.paid += salary;
		} catch (e) {
			if (!(e instanceof Error) || e.message !== 'INSUFFICIENT_FUNDS') throw e;
			await ctx.db.patch(room._id, { worker: undefined });
			await emit(ctx, room.playerId, {
				type: 'worker.left',
				roomId: room._id,
				workerSlug: worker.slug
			});
			report.left.push(worker.name);
		}
		reports.set(room.playerId, report);
	}
	for (const report of reports.values())
		await ctx.db.insert('payrolls', { ...report, periodKey: period, createdAt: Date.now() });
	return { players: reports.size };
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

import { v } from 'convex/values';
import type { Doc, Id } from './_generated/dataModel';
import { internalMutation, mutation, query } from './_generated/server';
import { OFFICE_TIERS, PRODUCT_TITLES, PRODUCTS, type Product } from './model/constants';
import {
	availableHexes,
	buyItem,
	hiredSlugs,
	hireWorker,
	inventoryOf,
	itemsOfRoom,
	officeOf,
	openRoom,
	payroll,
	placeFromInventory,
	roomsOf,
	slotsForTier,
	tierInfo,
	upgradeOffice
} from './model/office';
import { requirePlayer } from './model/players';

export type RoomView = Doc<'rooms'> & { items: Array<{ slotId: string; itemSlug: string }> };

export type InventoryEntry = {
	_id: Id<'inventory'>;
	kind: 'item' | 'worker';
	slug: string;
	title: string;
	text: string;
};

export type OfficeView = {
	office: Doc<'offices'>;
	tier: (typeof OFFICE_TIERS)[number];
	slots: ReturnType<typeof slotsForTier>;
	rooms: RoomView[];
	available: Array<{ q: number; r: number; price: number }>;
	skills: Record<string, number>;
	nextTier: (typeof OFFICE_TIERS)[number] | null;
	catalog: Doc<'items'>[];
	workers: Doc<'workers'>[];
	products: Array<{ slug: Product; title: string; unlocked: boolean }>;
};

export const state = query({
	args: {},
	handler: async (ctx): Promise<OfficeView | null> => {
		const player = await requirePlayer(ctx);
		const office = await officeOf(ctx, player);
		if (!office) return null;
		const rooms = await roomsOf(ctx, office._id);
		const roomViews: RoomView[] = [];
		for (const room of rooms) {
			const items = await itemsOfRoom(ctx, room._id);
			roomViews.push({
				...room,
				items: items.map((i) => ({ slotId: i.slotId, itemSlug: i.itemSlug }))
			});
		}
		const skillDocs = await ctx.db
			.query('skills')
			.withIndex('by_player_product', (q) => q.eq('playerId', player._id))
			.collect();
		const hired = await hiredSlugs(ctx, player._id);
		const workers = (await ctx.db.query('workers').collect())
			.filter((w) => w.active && !hired.has(w.slug))
			.sort((a, b) => a.order - b.order);
		return {
			office,
			tier: tierInfo(office.tier),
			slots: slotsForTier(office.tier),
			rooms: roomViews,
			available: await availableHexes(ctx, office),
			skills: Object.fromEntries(skillDocs.map((s) => [s.product, s.level])),
			nextTier: OFFICE_TIERS.find((t) => t.tier === office.tier + 1) ?? null,
			catalog: await ctx.db.query('items').collect(),
			workers,
			products: PRODUCTS.map((slug) => ({
				slug,
				title: PRODUCT_TITLES[slug],
				unlocked: slug === 'rusender'
			}))
		};
	}
});

export const open = mutation({
	args: { q: v.number(), r: v.number() },
	handler: async (ctx, args) => {
		const player = await requirePlayer(ctx);
		return await openRoom(ctx, player, args.q, args.r);
	}
});

export const hire = mutation({
	args: { workerSlug: v.string() },
	handler: async (ctx, args) => {
		const player = await requirePlayer(ctx);
		await hireWorker(ctx, player, args.workerSlug);
	}
});

export const buy = mutation({
	args: { itemSlug: v.string() },
	handler: async (ctx, args) => {
		const player = await requirePlayer(ctx);
		await buyItem(ctx, player, args.itemSlug);
	}
});

export const place = mutation({
	args: { inventoryId: v.id('inventory'), roomId: v.id('rooms') },
	handler: async (ctx, args) => {
		const player = await requirePlayer(ctx);
		await placeFromInventory(ctx, player, args.inventoryId, args.roomId);
	}
});

export const inventory = query({
	args: {},
	handler: async (ctx): Promise<InventoryEntry[]> => {
		const player = await requirePlayer(ctx);
		const result: InventoryEntry[] = [];
		for (const entry of await inventoryOf(ctx, player._id)) {
			if (entry.kind === 'item') {
				const item = await ctx.db
					.query('items')
					.withIndex('by_slug', (q) => q.eq('slug', entry.slug))
					.unique();
				const effect = (item?.effect ?? {}) as { speed?: number; reward?: number };
				const parts: string[] = [];
				if (effect.speed) parts.push(`скорость +${Math.round(effect.speed * 100)}%`);
				if (effect.reward) parts.push(`награда +${Math.round(effect.reward * 100)}%`);
				result.push({
					_id: entry._id,
					kind: 'item',
					slug: entry.slug,
					title: item?.name ?? entry.slug,
					text: parts.join(' · ') || 'Предмет'
				});
			} else {
				const worker = await ctx.db
					.query('workers')
					.withIndex('by_slug', (q) => q.eq('slug', entry.slug))
					.unique();
				result.push({
					_id: entry._id,
					kind: 'worker',
					slug: entry.slug,
					title: worker?.name ?? entry.slug,
					text:
						worker && worker.speed > 0
							? `скорость +${Math.round(worker.speed * 100)}%`
							: 'Сотрудник'
				});
			}
		}
		return result.sort((a, b) => a.kind.localeCompare(b.kind));
	}
});

export const payrollInfo = query({
	args: {},
	handler: async (ctx) => {
		const player = await requirePlayer(ctx);
		const rooms = await ctx.db
			.query('rooms')
			.withIndex('by_player', (q) => q.eq('playerId', player._id))
			.collect();
		const workers = rooms
			.filter((r) => r.worker && !r.worker.isPlayer)
			.map((r) => ({ name: r.worker!.name, salary: r.worker!.salary ?? 0 }));
		const reports = await ctx.db
			.query('payrolls')
			.withIndex('by_player', (q) => q.eq('playerId', player._id))
			.collect();
		const lastReport = reports.sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;
		return {
			workers,
			total: workers.reduce((sum, w) => sum + w.salary, 0),
			lastReport
		};
	}
});

export const paySalaries = internalMutation({
	args: {},
	handler: async (ctx) => await payroll(ctx)
});

export const upgrade = mutation({
	args: { tier: v.number() },
	handler: async (ctx, { tier }) => {
		const player = await requirePlayer(ctx);
		await upgradeOffice(ctx, player, tier);
	}
});

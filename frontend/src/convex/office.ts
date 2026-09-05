import { v } from 'convex/values';
import type { Doc } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { OFFICE_TIERS, PRODUCT_TITLES, PRODUCTS, type Product } from './model/constants';
import {
	availableHexes,
	buyItem,
	hiredSlugs,
	hireWorker,
	itemsOfRoom,
	officeOf,
	openRoom,
	roomsOf,
	slotsForTier,
	tierInfo,
	upgradeOffice
} from './model/office';
import { requirePlayer } from './model/players';

export type RoomView = Doc<'rooms'> & { items: Array<{ slotId: string; itemSlug: string }> };

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
	args: { q: v.number(), r: v.number(), product: v.string() },
	handler: async (ctx, args) => {
		const player = await requirePlayer(ctx);
		return await openRoom(ctx, player, args.q, args.r, args.product);
	}
});

export const hire = mutation({
	args: { roomId: v.id('rooms'), workerSlug: v.string() },
	handler: async (ctx, args) => {
		const player = await requirePlayer(ctx);
		await hireWorker(ctx, player, args.roomId, args.workerSlug);
	}
});

export const buy = mutation({
	args: { roomId: v.id('rooms'), slotId: v.string(), itemSlug: v.string() },
	handler: async (ctx, args) => {
		const player = await requirePlayer(ctx);
		await buyItem(ctx, player, args.roomId, args.slotId, args.itemSlug);
	}
});

export const upgrade = mutation({
	args: { tier: v.number() },
	handler: async (ctx, { tier }) => {
		const player = await requirePlayer(ctx);
		await upgradeOffice(ctx, player, tier);
	}
});

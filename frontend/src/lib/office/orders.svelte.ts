import type { Id } from '../../convex/_generated/dataModel';

export type SelectedOffer = { id: Id<'offerSlots'>; product: string } | null;
export type DragState = {
	id: Id<'offerSlots'>;
	product: string;
	title: string;
	x: number;
	y: number;
} | null;

class OrdersUi {
	selectedOffer = $state<SelectedOffer>(null);
	quizOrderId = $state<Id<'orders'> | null>(null);
	drag = $state<DragState>(null);
	hoverRoomId = $state<string | null>(null);
	hitTest: ((clientX: number, clientY: number) => string | null) | null = null;
	projectRoom: ((roomId: string) => { x: number; y: number } | null) | null = null;
}

export const ordersUi = new OrdersUi();

export function formatRemaining(ms: number): string {
	const total = Math.max(0, Math.ceil(ms / 1000));
	const m = Math.floor(total / 60);
	const s = total % 60;
	return `${m}:${s.toString().padStart(2, '0')}`;
}

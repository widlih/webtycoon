import type { Id } from '../../convex/_generated/dataModel';

export type DragKind = 'offer' | 'item' | 'worker';
export type SelectedOffer = { id: string; kind: DragKind; product?: string } | null;
export type DragState = {
	id: string;
	kind: DragKind;
	product?: string;
	title: string;
	x: number;
	y: number;
} | null;

class OrdersUi {
	selectedOffer = $state<SelectedOffer>(null);
	quizOrderId = $state<Id<'orders'> | null>(null);
	helpOrderId = $state<Id<'orders'> | null>(null);
	buildOrderId = $state<Id<'orders'> | null>(null);
	buildKind = $state<'build' | 'flow' | 'memory'>('build');
	drag = $state<DragState>(null);
	hoverRoomId = $state<string | null>(null);
	inventoryOpen = $state(false);
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

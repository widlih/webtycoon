<script lang="ts">
	import { T } from '@threlte/core';
	import type { IntersectionEvent } from '@threlte/extras';
	import { Color } from 'three';
	import { Tween } from 'svelte/motion';
	import { backOut, cubicOut } from 'svelte/easing';
	import type { OfficeView, RoomView } from '../../convex/office';
	import { DESK_POSITION } from '../../convex/model/constants';
	import { hexToWorld } from '../../convex/model/hex';
	import Furniture from './Furniture.svelte';
	import type { WorkerMode } from './Worker.svelte';
	import WorkerSprite from './WorkerSprite.svelte';
	import { portrait } from '$lib/market/people';
	import { hexGeometry } from './models/hexGeometry';
	import { posterTexture } from './models/posters';

	let {
		room,
		slots,
		tileRadius,
		rim = 0.14,
		selected,
		workerMode = 'idle',
		fresh = false,
		onselect
	}: {
		room: RoomView;
		slots: OfficeView['slots'];
		tileRadius: number;
		rim?: number;
		selected: boolean;
		workerMode?: WorkerMode;
		fresh?: boolean;
		onselect: () => void;
	} = $props();

	// svelte-ignore state_referenced_locally
	const pop = new Tween(fresh ? 0.01 : 1, { duration: 700, easing: backOut });
	$effect(() => {
		if (fresh) pop.set(1);
	});

	const position = $derived(hexToWorld(room.q, room.r));
	const accent = '#a981ff';
	const pastel = $derived('#' + new Color(accent).lerp(new Color('#ffffff'), 0.66).getHexString());

	const wallHeight = 2.6;
	const wall = 0.16;
	const backEdges = [150, 210, 270];
	const apothem = $derived((tileRadius * Math.sqrt(3)) / 2);
	const tile = $derived(hexGeometry(tileRadius, 0.3));
	const ring = $derived(hexGeometry(tileRadius + rim, 0.1, 0.03));

	const FACE = Math.PI / 4;
	const depth = { x: -Math.SQRT1_2, z: -Math.SQRT1_2 };
	const across = { x: Math.SQRT1_2, z: -Math.SQRT1_2 };
	function at(d: number, s: number, y = 0): [number, number, number] {
		return [
			DESK_POSITION.x + depth.x * d + across.x * s,
			y,
			DESK_POSITION.z + depth.z * d + across.z * s
		];
	}
	const FLOOR = 0.3;
	const DESK_TOP = 0.88;
	const SEAT = 0.5;

	const has = (slug: string) => room.items.some((i) => i.itemSlug === slug);
	const twoScreens = $derived(has('monitor-2'));
	const ergo = $derived(has('chair-ergo'));
	const rug = $derived(has('rug-round'));
	const seated = $derived(workerMode === 'working');

	const workerUrl = $derived(
		room.worker
			? (portrait(room.worker.isPlayer ? 'player' : room.worker.name, 'sit') ?? '/img/worker.png')
			: null
	);

	function posterAt(x: number, z: number) {
		const inner = apothem - wall;
		let best = backEdges[0];
		let bestDist = Infinity;
		for (const deg of backEdges) {
			const a = (deg * Math.PI) / 180;
			const dist = Math.hypot(x - Math.sin(a) * inner, z - Math.cos(a) * inner);
			if (dist < bestDist) {
				bestDist = dist;
				best = deg;
			}
		}
		const a = (best * Math.PI) / 180;
		const ux = Math.cos(a);
		const uz = -Math.sin(a);
		const wx = Math.sin(a) * inner;
		const wz = Math.cos(a) * inner;
		const along = Math.max(-1.1, Math.min(1.1, (x - wx) * ux + (z - wz) * uz));
		return {
			position: [
				wx - Math.sin(a) * 0.03 + ux * along,
				FLOOR + 1.45,
				wz - Math.cos(a) * 0.03 + uz * along
			] as [number, number, number],
			rotation: a + Math.PI
		};
	}
</script>

<T.Group
	position={[position.x, 0, position.z]}
	scale={pop.current}
	onclick={(e: IntersectionEvent<MouseEvent>) => {
		e.stopPropagation();
		onselect();
	}}
>
	{#if selected}
		<T.Mesh geometry={ring} position={[0, -0.02, 0]}>
			<T.MeshStandardMaterial color="#a981ff" roughness={0.8} />
		</T.Mesh>
	{/if}
	<T.Mesh geometry={tile} castShadow receiveShadow>
		<T.MeshStandardMaterial color="#ffffff" roughness={0.75} />
	</T.Mesh>
	{#each backEdges as deg (deg)}
		{@const a = (deg * Math.PI) / 180}
		{@const d = apothem - wall / 2}
		{@const s = apothem - wall - 0.02}
		<T.Mesh
			position={[Math.sin(a) * d, wallHeight / 2 + FLOOR, Math.cos(a) * d]}
			rotation.y={a}
			castShadow
			receiveShadow
		>
			<T.BoxGeometry args={[tileRadius, wallHeight, wall]} />
			<T.MeshStandardMaterial color={pastel} roughness={0.82} />
		</T.Mesh>
		<T.Mesh
			position={[Math.sin(a) * s, FLOOR + 0.16, Math.cos(a) * s]}
			rotation.y={a}
			receiveShadow
		>
			<T.BoxGeometry args={[tileRadius, 0.32, 0.04]} />
			<T.MeshStandardMaterial color={accent} roughness={0.7} />
		</T.Mesh>
	{/each}

	{#if !room.worker}
		<Furniture model="desk" position={at(0, 0, FLOOR)} rotation={FACE} />
		{#if !room.worker}
			<Furniture
				model={ergo ? 'chairDesk' : 'chair'}
				position={at(0.85, 0, FLOOR)}
				rotation={FACE}
			/>
		{/if}
		<Furniture
			model="screen"
			position={at(-0.16, twoScreens ? 0.28 : 0, FLOOR + DESK_TOP)}
			rotation={FACE + Math.PI + (twoScreens ? -0.2 : 0)}
		/>
		{#if twoScreens}
			<Furniture
				model="screen"
				position={at(-0.1, -0.62, FLOOR + DESK_TOP)}
				rotation={FACE + Math.PI + 0.35}
			/>
		{/if}
		<Furniture
			model="keyboard"
			position={at(0.18, 0, FLOOR + DESK_TOP)}
			rotation={FACE + Math.PI}
		/>
		<Furniture model="mouse" position={at(0.18, 0.5, FLOOR + DESK_TOP)} rotation={FACE + Math.PI} />
	{/if}

	{#if workerUrl}
		{#key workerUrl}
			<WorkerSprite url={workerUrl} position={at(0.45, 0.1, FLOOR + 1.0)} />
		{/key}
	{/if}
</T.Group>

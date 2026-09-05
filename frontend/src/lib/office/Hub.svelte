<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { PMREMGenerator, Raycaster, Vector2, Vector3, type Mesh } from 'three';
	import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
	import RoomBadge from './RoomBadge.svelte';
	import { HTML, SoftShadows, interactivity, type IntersectionEvent } from '@threlte/extras';
	import { hexGeometry } from './models/hexGeometry';
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import type { OfficeView } from '../../convex/office';
	import {
		HEX_SPACING,
		hexKey,
		hexToWorld,
		hexesWithinRadius,
		radiusForCapacity
	} from '../../convex/model/hex';
	import Room from './Room.svelte';
	import Price from '$lib/landing/Price.svelte';
	import { useQuery } from 'convex-svelte';
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { api } from '../../convex/_generated/api';
	import { ordersUi } from './orders.svelte';

	let {
		view,
		selectedRoomId,
		selectedHex,
		shiftX = 0,
		shiftY = 0,
		onSelectRoom,
		onSelectHex,
		onDeselect
	}: {
		view: OfficeView;
		selectedRoomId: string | null;
		selectedHex: { q: number; r: number } | null;
		shiftX?: number;
		shiftY?: number;
		onSelectRoom: (id: string) => void;
		onSelectHex: (hex: { q: number; r: number }) => void;
		onDeselect: () => void;
	} = $props();

	interactivity();

	const TILE_RADIUS = HEX_SPACING - 0.22;
	const RIM = 0.14;
	const SELECTED_ZOOM = 70;
	const tileGeometry = hexGeometry(TILE_RADIUS, 0.3);
	const lockedGeometry = hexGeometry(TILE_RADIUS, 0.12, 0.04);
	const ringGeometry = hexGeometry(TILE_RADIUS + RIM, 0.1, 0.03);
	const acceptGeometry = hexGeometry(TILE_RADIUS + RIM * 2, 0.08, 0.03);

	const elevation = (40 * Math.PI) / 180;
	const azimuth = Math.PI / 4;
	const distance = 40;
	const offset = [
		distance * Math.cos(elevation) * Math.sin(azimuth),
		distance * Math.sin(elevation),
		distance * Math.cos(elevation) * Math.cos(azimuth)
	] as [number, number, number];

	const target = new Tween({ x: 0, z: 0 }, { duration: 500, easing: cubicOut });
	const zoom = new Tween(34, { duration: 500, easing: cubicOut });

	$effect(() => {
		const room = view.rooms.find((r) => r._id === selectedRoomId);
		const hex = room ? { q: room.q, r: room.r } : selectedHex;
		if (hex) {
			const p = hexToWorld(hex.q, hex.r);
			const right = shiftX / SELECTED_ZOOM;
			const up = shiftY / SELECTED_ZOOM / Math.sin(elevation);
			target.set({
				x: p.x + right * Math.cos(azimuth) - up * Math.sin(azimuth),
				z: p.z - right * Math.sin(azimuth) - up * Math.cos(azimuth)
			});
			zoom.set(SELECTED_ZOOM);
		} else {
			target.set({ x: 0, z: 0 });
			zoom.set(34);
		}
	});

	const taken = $derived(
		new Set([
			...view.rooms.map((r) => hexKey(r.q, r.r)),
			...view.available.map((h) => hexKey(h.q, h.r))
		])
	);
	const locked = $derived(
		hexesWithinRadius(radiusForCapacity(view.tier.hexCapacity)).filter(
			(h) => !taken.has(hexKey(h.q, h.r))
		)
	);

	let hovered = $state<string | null>(null);

	const activeOrders = useQuery(api.orders.active, {});
	let now = $state(Date.now());
	onMount(() => {
		const id = setInterval(() => (now = Date.now()), 1000);
		return () => clearInterval(id);
	});

	function roomOrder(roomId: string) {
		return activeOrders.data?.find((o) => o.roomId === roomId) ?? null;
	}

	function acceptsOffer(room: { _id: string; product: string; worker?: unknown }): boolean {
		const offer = ordersUi.selectedOffer ?? ordersUi.drag;
		if (!offer || !room.worker || room.product !== offer.product) return false;
		return !activeOrders.data?.some((o) => o.roomId === room._id);
	}

	const { camera, renderer, scene } = useThrelte();
	onMount(() => {
		const pmrem = new PMREMGenerator(renderer);
		const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
		pmrem.dispose();
		scene.environment = env;
		scene.environmentIntensity = 0.45;
		return () => {
			scene.environment = null;
			env.dispose();
		};
	});
	const hitMeshes = new SvelteMap<string, Mesh>();
	const raycaster = new Raycaster();
	const pointer = new Vector2();
	const probe = new Vector3();

	function ndc(clientX: number, clientY: number) {
		const rect = renderer.domElement.getBoundingClientRect();
		pointer.set(
			((clientX - rect.left) / rect.width) * 2 - 1,
			-((clientY - rect.top) / rect.height) * 2 + 1
		);
		return rect;
	}

	onMount(() => {
		ordersUi.hitTest = (clientX, clientY) => {
			ndc(clientX, clientY);
			raycaster.setFromCamera(pointer, camera.current);
			const hit = raycaster.intersectObjects([...hitMeshes.values()], false)[0];
			return (hit?.object.userData.roomId as string | undefined) ?? null;
		};
		ordersUi.projectRoom = (roomId) => {
			const room = view.rooms.find((r) => r._id === roomId);
			if (!room) return null;
			const rect = renderer.domElement.getBoundingClientRect();
			const p = hexToWorld(room.q, room.r);
			probe.set(p.x, 1.5, p.z).project(camera.current);
			return {
				x: rect.left + ((probe.x + 1) / 2) * rect.width,
				y: rect.top + ((1 - probe.y) / 2) * rect.height
			};
		};
		return () => {
			ordersUi.hitTest = null;
			ordersUi.projectRoom = null;
		};
	});
</script>

<T.Group position={[target.current.x, 0, target.current.z]}>
	<T.OrthographicCamera
		makeDefault
		position={offset}
		zoom={zoom.current}
		near={0.1}
		far={200}
		oncreate={(ref) => ref.lookAt(0, 0, 0)}
	/>
</T.Group>

<SoftShadows size={14} samples={10} focus={0.4} />
<T.HemisphereLight args={['#ffffff', '#d7d7db', 0.7]} />
<T.DirectionalLight
	position={[14, 24, 10]}
	intensity={1.8}
	castShadow
	shadow.mapSize.width={2048}
	shadow.mapSize.height={2048}
	shadow.camera.left={-24}
	shadow.camera.right={24}
	shadow.camera.top={24}
	shadow.camera.bottom={-24}
	shadow.camera.near={1}
	shadow.camera.far={80}
	shadow.bias={-0.0004}
	shadow.radius={4}
/>

<T.Mesh
	position={[0, -0.01, 0]}
	rotation.x={-Math.PI / 2}
	receiveShadow
	onclick={(e: IntersectionEvent<MouseEvent>) => {
		e.stopPropagation();
		onDeselect();
	}}
>
	<T.PlaneGeometry args={[200, 200]} />
	<T.ShadowMaterial transparent opacity={0.1} />
</T.Mesh>

{#each locked as hex (hexKey(hex.q, hex.r))}
	{@const p = hexToWorld(hex.q, hex.r)}
	<T.Mesh geometry={lockedGeometry} position={[p.x, 0, p.z]} receiveShadow>
		<T.MeshStandardMaterial color="#e6e5e9" roughness={0.95} transparent opacity={0.6} />
	</T.Mesh>
{/each}

{#each view.available as hex (hexKey(hex.q, hex.r))}
	{@const p = hexToWorld(hex.q, hex.r)}
	{@const key = hexKey(hex.q, hex.r)}
	{@const active = selectedHex?.q === hex.q && selectedHex?.r === hex.r}
	{@const lift = active ? 0.22 : hovered === key ? 0.12 : 0}
	<T.Group position={[p.x, lift, p.z]}>
		{#if active}
			<T.Mesh geometry={ringGeometry} position={[0, -0.02, 0]}>
				<T.MeshStandardMaterial color="#a981ff" roughness={0.8} />
			</T.Mesh>
		{/if}
		<T.Mesh
			geometry={tileGeometry}
			castShadow
			receiveShadow
			onclick={(e: IntersectionEvent<MouseEvent>) => {
				e.stopPropagation();
				onSelectHex({ q: hex.q, r: hex.r });
			}}
			onpointerenter={() => (hovered = key)}
			onpointerleave={() => (hovered = null)}
		>
			<T.MeshStandardMaterial color="#ffffff" roughness={0.9} />
		</T.Mesh>
		<HTML position={[0, 0.9, 0]} center pointerEvents="none" zIndexRange={[5, 0]}>
			<div class="app-tag"><Price value={hex.price} prefix="+" /></div>
		</HTML>
	</T.Group>
{/each}

{#each view.rooms as room (room._id)}
	{@const p = hexToWorld(room.q, room.r)}
	{@const order = roomOrder(room._id)}
	{@const accepts = acceptsOffer(room)}
	{@const hovering = ordersUi.hoverRoomId === room._id}
	<T.Mesh
		position={[p.x, 1.5, p.z]}
		visible={false}
		oncreate={(mesh) => {
			mesh.userData.roomId = room._id;
			hitMeshes.set(room._id, mesh);
			return () => hitMeshes.delete(room._id);
		}}
	>
		<T.CylinderGeometry args={[TILE_RADIUS, TILE_RADIUS, 3, 6]} />
		<T.MeshBasicMaterial />
	</T.Mesh>
	{#if accepts}
		<T.Mesh geometry={acceptGeometry} position={[p.x, -0.03, p.z]}>
			<T.MeshStandardMaterial color={hovering ? '#7c4dff' : '#a981ff'} roughness={0.8} />
		</T.Mesh>
	{/if}
	<Room
		{room}
		slots={view.slots}
		tileRadius={TILE_RADIUS}
		rim={RIM}
		selected={room._id === selectedRoomId}
		workerMode={order ? ((order.endsAt ?? 0) <= now ? 'ready' : 'working') : 'idle'}
		onselect={() => onSelectRoom(room._id)}
	/>
	{#if room.worker}
		<HTML position={[p.x, 3.1, p.z]} center pointerEvents="none" zIndexRange={[5, 0]}>
			{#if order}
				<RoomBadge
					title={order.title}
					remaining={(order.endsAt ?? now) - now}
					total={(order.endsAt ?? 0) - (order.startedAt ?? 0)}
					ready={(order.endsAt ?? 0) <= now}
				/>
			{:else}
				<div class="app-tag">свободен</div>
			{/if}
		</HTML>
	{/if}
{/each}

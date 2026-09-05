<script lang="ts" module>
	export type WorkerMode = 'idle' | 'working' | 'ready';
</script>

<script lang="ts">
	import { T } from '@threlte/core';
	import { useGltf, useGltfAnimations, useMeshopt } from '@threlte/extras';
	import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
	import { untrack } from 'svelte';
	import type { AnimationAction, Mesh, Object3D } from 'three';
	import { characterFor, characterUrl } from './models/characters';

	let {
		name,
		isPlayer = false,
		mode = 'idle',
		position = [0, 0, 0],
		rotation = 0,
		scale = 2.3
	}: {
		name: string;
		isPlayer?: boolean;
		mode?: WorkerMode;
		position?: [number, number, number];
		rotation?: number;
		scale?: number;
	} = $props();

	const gltf = useGltf(
		untrack(() => characterUrl(characterFor(name, isPlayer))),
		{
			meshoptDecoder: useMeshopt()
		}
	);

	const model = $derived.by(() => {
		if (!$gltf) return undefined;
		const obj = cloneSkinned($gltf.scene) as Object3D;
		obj.traverse((o) => {
			const m = o as Mesh;
			if (m.isMesh) {
				m.castShadow = true;
				m.receiveShadow = true;
				m.frustumCulled = false;
			}
		});
		return obj;
	});

	const { actions } = useGltfAnimations<'idle' | 'sit' | 'emote-yes'>(
		() => $gltf,
		() => model
	);

	let current: AnimationAction | undefined;
	$effect(() => {
		const a = $actions;
		const next = mode === 'working' ? a.sit : mode === 'ready' ? a['emote-yes'] : a.idle;
		if (!next || next === current) return;
		current?.fadeOut(0.25);
		next.reset().fadeIn(0.25).play();
		current = next;
	});
</script>

{#if model}
	<T.Group {position} rotation.y={rotation} {scale}>
		<T is={model} />
	</T.Group>
{/if}

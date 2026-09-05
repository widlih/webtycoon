<script lang="ts">
	import { T } from '@threlte/core';
	import { useGltf, useMeshopt } from '@threlte/extras';
	import type { Mesh, Object3D } from 'three';

	let {
		model,
		position = [0, 0, 0],
		rotation = 0,
		scale = 1
	}: {
		model: string;
		position?: [number, number, number];
		rotation?: number;
		scale?: number;
	} = $props();

	const gltf = useGltf('/models/furniture.glb', { meshoptDecoder: useMeshopt() });

	const object = $derived.by(() => {
		const src = $gltf?.scene.children.find((c: Object3D) => c.name === model);
		if (!src) return undefined;
		const obj = src.clone(true);
		obj.traverse((o) => {
			const m = o as Mesh;
			if (m.isMesh) {
				m.castShadow = true;
				m.receiveShadow = true;
			}
		});
		return obj;
	});
</script>

{#if object}
	<T.Group {position} rotation.y={rotation} {scale}>
		<T is={object} />
	</T.Group>
{/if}

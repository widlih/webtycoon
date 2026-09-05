<script lang="ts">
	import { T } from '@threlte/core';
	import { useTexture } from '@threlte/extras';
	import { untrack } from 'svelte';
	import { SRGBColorSpace } from 'three';

	let {
		url,
		position,
		scale = 2.1
	}: { url: string; position: [number, number, number]; scale?: number } = $props();

	const texture = useTexture(untrack(() => url), {
		transform: (t) => {
			t.colorSpace = SRGBColorSpace;
			return t;
		}
	});
</script>

{#if $texture}
	<T.Sprite {position} scale={[scale, scale, 1]}>
		<T.SpriteMaterial map={$texture} transparent depthWrite={false} />
	</T.Sprite>
{/if}

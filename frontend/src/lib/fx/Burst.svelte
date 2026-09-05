<script lang="ts">
	import { onMount } from 'svelte';
	import { burst } from './fly';

	let el: HTMLSpanElement;
	onMount(() => {
		burst(el);
	});
</script>

<span bind:this={el} class="fx-anchor"></span>

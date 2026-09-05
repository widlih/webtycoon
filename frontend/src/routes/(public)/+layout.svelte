<script lang="ts">
	import { onMount } from 'svelte';
	import '$lib/landing/landing.css';

	let { children } = $props();

	onMount(() => {
		const ref = new URLSearchParams(location.search).get('ref');
		if (ref) {
			try {
				localStorage.setItem('wt.ref', ref);
			} catch {
				/* storage unavailable */
			}
		}
	});
</script>

{@render children()}

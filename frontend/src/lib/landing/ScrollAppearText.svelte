<script lang="ts">
	import { onMount } from 'svelte';

	let { text }: { text: string } = $props();
	let el: HTMLDivElement;

	onMount(() => {
		let cleanup = () => {};
		let cancelled = false;
		(async () => {
			const [{ gsap }, { ScrollTrigger }, { SplitText }] = await Promise.all([
				import('gsap'),
				import('gsap/ScrollTrigger'),
				import('gsap/SplitText')
			]);
			await document.fonts.ready;
			if (cancelled) return;
			gsap.registerPlugin(ScrollTrigger, SplitText);
			const split = SplitText.create(el, { type: 'words' });
			const tween = gsap.to(split.words, {
				color: '#000000',
				duration: 0.25,
				stagger: 1,
				scrollTrigger: { trigger: el, start: 'top bottom-=60px', end: 'center center', scrub: true }
			});
			cleanup = () => {
				tween.scrollTrigger?.kill();
				tween.kill();
				split.revert();
			};
		})();
		return () => {
			cancelled = true;
			cleanup();
		};
	});
</script>

<section class="lp-appear">
	<div class="lp-container lp-grid">
		<div class="lp-appear__text" bind:this={el}>{text}</div>
	</div>
</section>

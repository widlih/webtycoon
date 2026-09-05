<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from './Button.svelte';

	let {
		title,
		text,
		cta,
		columns
	}: {
		title: string;
		text: string;
		cta: string;
		columns: { title: string; links: { label: string; href: string }[] }[];
	} = $props();
</script>

<footer class="lp-footer">
	<div class="lp-footer__inner">
		<div class="lp-container">
			<div class="lp-footer__grid">
				<div class="lp-footer__top">
					<h2 class="lp-footer__title">{title}</h2>
					<p class="lp-footer__text">
						{text}
						<img
							class="lp-footer__emoji"
							src="/img/landing/wink.webp"
							alt=""
							width="450"
							height="450"
							loading="lazy"
						/>
					</p>
					<div class="lp-footer__cta">
						<Button href={resolve('/login')} color="black" size="medium">{cta}</Button>
					</div>
				</div>
				<div class="lp-footer__center">
					{#each columns as column (column.title)}
						<div class="lp-footer__column">
							<h3 class="lp-footer__coltitle">{column.title}</h3>
							<ul class="lp-footer__links">
								{#each column.links as link (link.href)}
									<li><a class="lp-footer__link" href={link.href}>{link.label}</a></li>
								{/each}
							</ul>
						</div>
					{/each}
				</div>
				<div class="lp-footer__bottom">
					<div>© {new Date().getFullYear()} WebTycoon</div>
				</div>
			</div>
		</div>
	</div>
</footer>

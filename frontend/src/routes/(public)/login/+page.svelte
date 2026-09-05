<script lang="ts">
	import { resolve } from '$app/paths';
	import Header from '$lib/landing/Header.svelte';
	import AuthForm from '$lib/components/AuthForm.svelte';
</script>

<svelte:head>
	<title>Вход — WebTycoon</title>
</svelte:head>

<div class="lp">
	<Header links={[]} />
	<main id="main-content" class="lp-auth">
		<div class="lp-container">
			<h1 class="lp-h2" style="text-align:center">Вход</h1>
			<AuthForm />
			<p class="lp-auth__note">
				Регистрируясь, вы принимаете <a href={resolve('/rules')}>правила</a> и
				<a href={resolve('/privacy')}>политику обработки данных</a>.
			</p>
		</div>
	</main>
</div>

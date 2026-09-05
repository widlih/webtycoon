<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
</script>

<main class="flex min-h-screen flex-col items-center justify-center gap-2 p-6">
	<h1 class="text-4xl font-semibold">{page.status}</h1>
	<p class="text-neutral-500">{page.error?.message}</p>
	<a href={resolve('/')} class="mt-4 underline">На главную</a>
</main>

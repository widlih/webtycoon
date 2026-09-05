<script lang="ts">
	import { page } from '$app/state';
	import Lesson from '$lib/lessons/engine/Lesson.svelte';
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../../../convex/_generated/api';
	import type { LessonStep } from '../../../../../convex/model/lessonSteps';

	const lesson = useQuery(api.lessons.get, () => ({ slug: page.params.slug ?? '' }));
</script>

<main class="lp-container app-page">
	{#if lesson.isLoading}
		<p class="app-hint">Загрузка…</p>
	{:else if lesson.data}
		<h1 class="lesson-title">{lesson.data.title}</h1>
		{#if lesson.data.description}<p class="lesson-lead">{lesson.data.description}</p>{/if}
		<Lesson lesson={{ slug: lesson.data.slug, steps: lesson.data.steps as LessonStep[] }} />
	{:else}
		<p class="app-hint">Урок не найден</p>
	{/if}
</main>

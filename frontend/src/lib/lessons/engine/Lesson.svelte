<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '$lib/landing/Button.svelte';
	import Price from '$lib/landing/Price.svelte';
	import Burst from '$lib/fx/Burst.svelte';
	import { centerOf, flyReward } from '$lib/fx/fly';
	import { useMutation } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api';
	import type { LessonStep } from '../../../convex/model/lessonSteps';
	import { widgets } from '../widgets';
	import { isInstant, validate, type Action } from './validate';

	let { lesson }: { lesson: { slug: string; steps: LessonStep[] } } = $props();

	const complete = useMutation(api.lessons.complete);

	let index = $state(0);
	let action = $state<Action | null>(null);
	let wrong = $state(false);
	let showHint = $state(false);
	let finished = $state<{
		reward: { coins: number; xp: number } | null;
		skillLevel: number;
		alreadyCompleted: boolean;
	} | null>(null);
	let busy = $state(false);
	let doneBox = $state<HTMLDivElement | null>(null);

	const step = $derived(lesson.steps[index]);
	const Widget = $derived(widgets[step.widget]);

	function onaction(next: Action) {
		action = next;
		wrong = false;
		if (isInstant(step)) check();
	}

	async function check() {
		if (validate(step, action)) {
			wrong = false;
			showHint = false;
			action = null;
			if (index < lesson.steps.length - 1) index += 1;
			else await finish();
		} else {
			wrong = true;
			showHint = true;
		}
	}

	async function finish() {
		busy = true;
		try {
			finished = await complete({ slug: lesson.slug });
			if (finished.reward) {
				const reward = finished.reward;
				setTimeout(() => flyReward(centerOf(doneBox), reward), 350);
			}
		} finally {
			busy = false;
		}
	}
</script>

<section class="lesson">
	{#if finished}
		<div class="lesson__done" bind:this={doneBox}>
			<Burst />
			<h2>Урок пройден</h2>
			{#if finished.reward}
				<p class="lesson__reward">
					<Price value={finished.reward.coins} />
					<Price value={finished.reward.xp} kind="xp" />
				</p>
				<p class="app-muted">Отдел вырос до уровня {finished.skillLevel}</p>
			{:else}
				<p class="app-muted">Награда за этот урок уже была получена</p>
			{/if}
			<div class="app-panel__action">
				<Button color="black" size="medium" href={resolve('/app/lessons')}>К урокам</Button>
			</div>
		</div>
	{:else}
		<div class="lesson__progress" aria-label="Шаг {index + 1} из {lesson.steps.length}">
			<div class="lesson__bar">
				<div class="lesson__fill" style="width: {(index / lesson.steps.length) * 100}%"></div>
			</div>
			<span class="lesson__step">Шаг {index + 1} из {lesson.steps.length}</span>
		</div>
		<div class="lesson__task">
			<span class="lesson__task-label">Задание {index + 1}</span>
			<p class="lesson__task-text">{step.prompt}</p>
		</div>
		<div class="lesson__widget" class:is-wrong={wrong}>
			{#key index}
				<Widget {step} {onaction} {wrong} />
			{/key}
		</div>
		{#if showHint && step.hint}
			<p class="lesson__hint">{step.hint}</p>
		{/if}
		{#if !isInstant(step)}
			<div class="app-panel__action">
				<Button color="black" size="medium" disabled={busy || action === null} onclick={check}
					>Проверить</Button
				>
			</div>
		{/if}
	{/if}
</section>

<style>
	.lesson {
		display: grid;
		gap: 16px;
	}
	.lesson__progress {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.lesson__bar {
		flex: 1;
		height: 6px;
		border-radius: 6px;
		background: var(--gray);
		overflow: hidden;
	}
	.lesson__fill {
		height: 100%;
		border-radius: 6px;
		background: var(--ink);
		transition: width 0.6s var(--quad);
	}
	.lesson__step {
		color: var(--muted);
		font: 400 14px/1 var(--text-font);
		white-space: nowrap;
	}
	.lesson__task {
		display: grid;
		gap: 8px;
		padding: 20px 24px;
		border-radius: 24px;
		background: var(--yellow);
		color: var(--ink);
	}
	.lesson__task-label {
		font: 700 12px/1 var(--display);
		letter-spacing: 0.6px;
		text-transform: uppercase;
		opacity: 0.7;
	}
	.lesson__task-text {
		margin: 0;
		font: 600 20px/130% var(--display);
		letter-spacing: -0.4px;
		text-wrap: pretty;
	}
	@media screen and (min-width: 1025px) {
		.lesson__task-text {
			font-size: 22px;
		}
	}
	.lesson__widget {
		border-radius: 32px;
		background: var(--gray);
		padding: 24px;
		border: 2px solid transparent;
		transition: border-color 0.2s var(--quad);
	}
	.lesson__widget.is-wrong {
		border-color: #fd3456;
	}
	.lesson__hint {
		margin: 0;
		align-self: start;
		display: inline-block;
		background: var(--yellow);
		color: var(--ink);
		border-radius: 20px;
		padding: 8px 14px;
		font: 400 14px/140% var(--text-font);
	}
	.lesson__done {
		display: grid;
		gap: 12px;
		justify-items: center;
		text-align: center;
		padding: 40px 24px;
		border-radius: 32px;
		background: var(--yellow);
	}
	.lesson__done h2 {
		margin: 0;
		font: 800 32px/1 var(--display);
		letter-spacing: -1.28px;
	}
	.lesson__reward {
		display: flex;
		justify-content: center;
		gap: 16px;
		font: 600 20px/1 var(--display);
	}
	@media screen and (min-width: 1025px) {
		.lesson__widget {
			padding: 30px;
		}
	}
</style>

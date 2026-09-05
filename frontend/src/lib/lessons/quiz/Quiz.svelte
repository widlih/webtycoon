<script lang="ts">
	import { Check, X } from '@lucide/svelte';
	import { useMutation } from 'convex-svelte';
	import Button from '$lib/landing/Button.svelte';
	import Price from '$lib/landing/Price.svelte';
	import Burst from '$lib/fx/Burst.svelte';
	import { centerOf, flyReward } from '$lib/fx/fly';
	import { api } from '../../../convex/_generated/api';
	import type { Doc } from '../../../convex/_generated/dataModel';
	import {
		QUIZ_BONUS_MULTIPLIER,
		QUIZ_ENERGY_COST,
		QUIZ_PASS_THRESHOLD
	} from '../../../convex/model/constants';

	let {
		orderId,
		portrait,
		onclose
	}: { orderId: Doc<'orders'>['_id']; portrait?: string; onclose: () => void } = $props();

	const start = useMutation(api.quizzes.start);
	const answer = useMutation(api.quizzes.answer);

	type Question = { id: Doc<'quizQuestions'>['_id']; question: string; options: string[] };
	let runId = $state<Doc<'quizRuns'>['_id'] | null>(null);
	let questions = $state<Question[]>([]);
	let picked = $state<number[]>([]);
	let result = $state<{
		passed: boolean;
		correct: number;
		results: boolean[];
		correctAnswers: number[];
		reward: { coins: number; xp: number } | null;
	} | null>(null);
	let error = $state('');
	let busy = $state(false);
	let started = false;
	let resultBox = $state<HTMLDivElement | null>(null);

	$effect(() => {
		if (!started) {
			started = true;
			load();
		}
	});

	async function load() {
		busy = true;
		try {
			const run = await start({ orderId });
			runId = run.runId;
			questions = run.questions;
			picked = run.questions.map(() => -1);
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			error = message.includes('NOT_ENOUGH_ENERGY') ? 'Не хватает энергии' : message;
		} finally {
			busy = false;
		}
	}

	async function submit() {
		if (!runId || picked.includes(-1)) return;
		busy = true;
		try {
			result = await answer({ runId, answers: picked });
			if (result.reward) {
				const reward = result.reward;
				setTimeout(() => flyReward(centerOf(resultBox), reward), 350);
			}
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			busy = false;
		}
	}

	const bonus = $derived(String(QUIZ_BONUS_MULTIPLIER).replace('.', ','));
</script>

<div class="app-modal" role="dialog" aria-modal="true">
	<div class="app-modal__box">
		<div class="app-panel__head">
			{#if portrait}<img class="quiz__face" src={portrait} alt="" />{/if}
			<div>
				<h2 class="app-panel__title">Помочь сотруднику</h2>
				{#if !result}
					<p class="app-panel__sub">
						Ответьте верно на все {QUIZ_PASS_THRESHOLD} вопроса, и заказ закроется сразу с бонусом ×{bonus}.
						Стоит <Price value={QUIZ_ENERGY_COST} kind="energy" />
					</p>
				{/if}
			</div>
			<button class="app-panel__close" aria-label="Закрыть" onclick={onclose}
				><X size={20} strokeWidth={2.25} /></button
			>
		</div>
		{#if error}
			<p class="app-error">{error}</p>
		{:else if questions.length === 0}
			<p class="app-hint">Подбираем вопросы…</p>
		{:else}
			{#if result}
				<div class="quiz__result" class:is-passed={result.passed} bind:this={resultBox}>
					{#if result.passed}
						<Burst />
						<p class="quiz__verdict">
							Заказ закрыт · {result.correct} из {questions.length} · бонус ×{bonus}
						</p>
						{#if result.reward}
							<p class="quiz__reward">
								<Price value={result.reward.coins} prefix="+" />
								<Price value={result.reward.xp} kind="xp" prefix="+" />
							</p>
						{/if}
					{:else}
						<p class="quiz__verdict">
							Не хватило верных ответов: {result.correct} из {questions.length}
						</p>
						<p class="quiz__note">
							Нужны все {QUIZ_PASS_THRESHOLD}. Заказ остался у сотрудника, энергия потрачена.
						</p>
					{/if}
				</div>
			{/if}
			<div class="quiz">
				{#each questions as q, i (q.id)}
					<div class="quiz__q">
						<p class="quiz__question"><span class="quiz__num">{i + 1}</span>{q.question}</p>
						<div class="quiz__options">
							{#each q.options as option, j (option)}
								{@const isPicked = picked[i] === j}
								{@const isCorrect = result ? result.correctAnswers[i] === j : false}
								{@const isWrong = result ? isPicked && !isCorrect : false}
								<button
									type="button"
									class="quiz__option"
									class:is-active={!result && isPicked}
									class:is-correct={isCorrect}
									class:is-wrong={isWrong}
									class:is-faded={result && !isCorrect && !isWrong}
									disabled={Boolean(result)}
									onclick={() => (picked[i] = j)}
								>
									<span class="quiz__mark">
										{#if isCorrect}<Check size={12} strokeWidth={3} />{:else if isWrong}<X
												size={12}
												strokeWidth={3}
											/>{/if}
									</span>{option}
								</button>
							{/each}
						</div>
					</div>
				{/each}
			</div>
			<div class="app-panel__action">
				{#if result}
					<Button color="black" size="medium" onclick={onclose}>Готово</Button>
				{:else}
					<Button
						color="black"
						size="medium"
						disabled={busy || picked.includes(-1)}
						onclick={submit}>Ответить</Button
					>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.quiz__face {
		flex: none;
		width: 96px;
		height: 96px;
		object-fit: contain;
		object-position: center bottom;
	}
</style>

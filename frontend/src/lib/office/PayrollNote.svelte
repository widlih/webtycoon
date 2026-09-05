<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import Price from '$lib/landing/Price.svelte';
	import { api } from '../../convex/_generated/api';

	const info = useQuery(api.office.payrollInfo, {});

	let seen = $state<string | null>(null);
	try {
		seen = localStorage.getItem('wt.payroll.seen');
	} catch {
		seen = null;
	}

	const report = $derived(
		info.data?.lastReport &&
			info.data.lastReport._id !== seen &&
			Date.now() - info.data.lastReport.createdAt < 24 * 60 * 60 * 1000
			? info.data.lastReport
			: null
	);

	function dismiss() {
		if (!report) return;
		seen = report._id;
		try {
			localStorage.setItem('wt.payroll.seen', report._id);
		} catch {
			/* storage unavailable */
		}
	}
</script>

{#if info.data}
	<div class="payroll">
		<span class="payroll__label">Ежедневные расходы</span>
		<span class="payroll__sum" data-tip="Зарплаты сотрудников списываются в полночь по Москве"
			><Price value={info.data.total} /></span
		>
		{#if report}
			<button class="payroll__report" onclick={dismiss} data-tip="Скрыть">
				Ночью −{report.paid}{report.left.length > 0
					? `, ${report.left.length === 1 ? 'ушёл' : 'ушли'} ${report.left.join(', ')}`
					: ''}
			</button>
		{/if}
	</div>
{/if}

<style>
	.payroll {
		position: absolute;
		left: 50%;
		top: 20px;
		transform: translateX(-50%);
		z-index: 20;
		display: grid;
		gap: 2px;
		justify-items: center;
		text-align: center;
		pointer-events: none;
	}
	.payroll__label {
		color: var(--secondary, #6e6e73);
		font: 400 13px/1 var(--text-font, system-ui);
		letter-spacing: -0.26px;
	}
	.payroll__sum {
		pointer-events: auto;
		color: var(--ink, #19171c);
		font: 600 18px/1 var(--display, system-ui);
		letter-spacing: -0.36px;
	}
	.payroll__report {
		pointer-events: auto;
		margin-top: 4px;
		padding: 5px 10px;
		border: 0;
		border-radius: 12px;
		background: var(--yellow, #f5ff63);
		color: var(--ink, #19171c);
		font: 500 12px/1.2 var(--text-font, system-ui);
		letter-spacing: -0.24px;
		text-align: left;
		cursor: pointer;
	}
	@media (max-width: 767px) {
		.payroll {
			top: 14px;
		}
		.payroll__sum {
			font-size: 16px;
		}
	}
</style>

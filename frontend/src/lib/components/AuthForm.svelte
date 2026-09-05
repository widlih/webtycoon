<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authClient } from '$lib/auth';
	import Button from '$lib/landing/Button.svelte';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let busy = $state(false);

	const messages: Record<string, string> = {
		INVALID_EMAIL_OR_PASSWORD: 'Неверный пароль.',
		INVALID_PASSWORD: 'Неверный пароль.',
		PASSWORD_TOO_SHORT: 'Пароль короче 8 символов.',
		INVALID_EMAIL: 'Проверьте email.',
		TOO_MANY_REQUESTS: 'Слишком много попыток, подождите минуту.'
	};

	function describe(result: { code?: string; status?: number; message?: string }) {
		return (
			messages[result.code ?? ''] ??
			(result.status === 429 ? messages.TOO_MANY_REQUESTS : (result.message ?? 'Не удалось войти'))
		);
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		error = '';
		busy = true;
		try {
			const signIn = await authClient.signIn.email({ email, password });
			if (!signIn.error) {
				await authClient.getSession();
				await goto(resolve('/app'));
				return;
			}
			const code = signIn.error.code ?? '';
			if (code !== 'USER_NOT_FOUND' && code !== 'INVALID_EMAIL_OR_PASSWORD') {
				error = describe(signIn.error);
				return;
			}
			const signUp = await authClient.signUp.email({ email, password, name: email.split('@')[0] });
			if (signUp.error) {
				error =
					signUp.error.code === 'USER_ALREADY_EXISTS'
						? messages.INVALID_PASSWORD
						: describe(signUp.error);
				return;
			}
			await authClient.getSession();
			await goto(resolve('/app'));
		} catch {
			error = 'Сервер недоступен, попробуйте ещё раз.';
		} finally {
			busy = false;
		}
	}
</script>

<form onsubmit={submit} class="lp-auth__form">
	<input
		class="lp-auth__input"
		type="email"
		placeholder="Email"
		bind:value={email}
		required
		autocomplete="email"
	/>
	<input
		class="lp-auth__input"
		type="password"
		placeholder="Пароль, от 8 символов"
		bind:value={password}
		required
		minlength="8"
		autocomplete="current-password"
	/>
	{#if error}
		<p class="lp-auth__error">{error}</p>
	{/if}
	<Button type="submit" color="black" size="medium" disabled={busy}>Продолжить</Button>
</form>

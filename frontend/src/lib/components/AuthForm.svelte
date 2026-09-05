<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authClient } from '$lib/auth';
	import Button from '$lib/landing/Button.svelte';

	let mode = $state<'signin' | 'signup'>('signin');
	let email = $state('');
	let password = $state('');
	let name = $state('');
	let error = $state('');
	let busy = $state(false);

	const messages: Record<string, string> = {
		USER_NOT_FOUND: 'Аккаунт с таким email не найден. Нажмите «Зарегистрироваться».',
		INVALID_EMAIL_OR_PASSWORD: 'Неверный email или пароль.',
		USER_ALREADY_EXISTS: 'Такой аккаунт уже есть. Нажмите «У меня уже есть аккаунт» и войдите.',
		PASSWORD_TOO_SHORT: 'Пароль короче 8 символов.',
		INVALID_EMAIL: 'Проверьте email.',
		TOO_MANY_REQUESTS: 'Слишком много попыток, подождите минуту.'
	};

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		error = '';
		busy = true;
		try {
			const result =
				mode === 'signup'
					? await authClient.signUp.email({ email, password, name: name || email.split('@')[0] })
					: await authClient.signIn.email({ email, password });
			if (result.error) {
				const code = result.error.code ?? '';
				error =
					messages[code] ??
					(result.error.status === 429
						? messages.TOO_MANY_REQUESTS
						: (result.error.message ?? 'Не удалось войти'));
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
	{#if mode === 'signup'}
		<input
			class="lp-auth__input"
			type="text"
			placeholder="Имя"
			bind:value={name}
			autocomplete="name"
		/>
	{/if}
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
		autocomplete={mode === 'signup' ? 'new-password' : 'current-password'}
	/>
	{#if error}
		<p class="lp-auth__error">{error}</p>
	{/if}
	<Button type="submit" color="black" size="medium" disabled={busy}>
		{mode === 'signup' ? 'Создать аккаунт' : 'Войти'}
	</Button>
	<button
		class="lp-auth__switch"
		type="button"
		onclick={() => (mode = mode === 'signup' ? 'signin' : 'signup')}
	>
		{mode === 'signup' ? 'У меня уже есть аккаунт' : 'Зарегистрироваться'}
	</button>
</form>

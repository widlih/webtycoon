import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { setupAuth, setupConvex } from 'convex-svelte';
import { fromStore } from 'svelte/store';
import { authClient } from './auth';

export function initConvex() {
	setupConvex(PUBLIC_CONVEX_URL);
	const session = fromStore(authClient.useSession());
	let cachedToken: string | null = null;
	let pending: Promise<string | null> | null = null;

	setupAuth(() => {
		const s = session.current;
		if (!s.data && !s.isPending) cachedToken = null;
		return {
			isLoading: s.isPending && !cachedToken,
			isAuthenticated: Boolean(s.data?.session) || cachedToken !== null,
			fetchAccessToken: async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
				if (cachedToken && !forceRefreshToken) return cachedToken;
				if (!forceRefreshToken && pending) return pending;
				pending = authClient.convex
					.token({ fetchOptions: { throw: false } })
					.then(({ data }) => {
						cachedToken = data?.token ?? null;
						return cachedToken;
					})
					.catch(() => {
						cachedToken = null;
						return null;
					})
					.finally(() => {
						pending = null;
					});
				return pending;
			}
		};
	});

	return session;
}

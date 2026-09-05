import { PUBLIC_CONVEX_SITE_URL } from '$env/static/public';
import { convexClient, crossDomainClient } from '@convex-dev/better-auth/client/plugins';
import { createAuthClient } from 'better-auth/svelte';

export const authClient = createAuthClient({
	baseURL: PUBLIC_CONVEX_SITE_URL,
	plugins: [convexClient(), crossDomainClient()]
});

import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const out = process.env.WT_OUT ?? 'build';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) => (filename.includes('node_modules') ? undefined : true)
			},
			adapter: adapter({ pages: out, assets: out, fallback: '200.html' }),
			outDir: process.env.WT_OUT ? `.svelte-kit-${process.env.WT_OUT}` : '.svelte-kit'
		})
	],
	ssr: { noExternal: ['three', '@threlte/core', '@threlte/extras'] }
});

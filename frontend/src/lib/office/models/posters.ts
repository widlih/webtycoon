import { CanvasTexture, SRGBColorSpace } from 'three';

const cache = new Map<string, CanvasTexture>();

function rounded(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number
) {
	ctx.beginPath();
	ctx.roundRect(x, y, w, h, r);
	ctx.fill();
}

export function posterTexture(slug: string, accent: string): CanvasTexture {
	const key = `${slug}|${accent}`;
	const hit = cache.get(key);
	if (hit) return hit;
	const canvas = document.createElement('canvas');
	canvas.width = 256;
	canvas.height = 320;
	const ctx = canvas.getContext('2d')!;
	ctx.fillStyle = '#ffffff';
	ctx.fillRect(0, 0, 256, 320);
	if (slug === 'poster-metrics') {
		const bars = [0.35, 0.55, 0.45, 0.8, 1];
		bars.forEach((v, i) => {
			ctx.fillStyle = i === bars.length - 1 ? accent : '#e6e4ea';
			rounded(ctx, 34 + i * 40, 216 - 150 * v, 26, 150 * v, 8);
		});
		ctx.fillStyle = '#111111';
		ctx.font = '700 30px Onest, Inter, system-ui, sans-serif';
		ctx.fillText('Метрики', 34, 276);
	} else {
		ctx.fillStyle = accent;
		ctx.beginPath();
		ctx.moveTo(128, 40);
		ctx.bezierCurveTo(176, 90, 176, 150, 156, 196);
		ctx.lineTo(100, 196);
		ctx.bezierCurveTo(80, 150, 80, 90, 128, 40);
		ctx.closePath();
		ctx.fill();
		ctx.fillStyle = '#ffffff';
		ctx.beginPath();
		ctx.arc(128, 118, 16, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = '#ffd166';
		ctx.beginPath();
		ctx.moveTo(108, 200);
		ctx.lineTo(148, 200);
		ctx.lineTo(128, 236);
		ctx.closePath();
		ctx.fill();
		ctx.fillStyle = '#111111';
		ctx.font = '700 30px Onest, Inter, system-ui, sans-serif';
		ctx.fillText('Запуск', 34, 286);
	}
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.anisotropy = 4;
	cache.set(key, texture);
	return texture;
}

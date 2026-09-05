import { ExtrudeGeometry, Shape } from 'three';

const cache = new Map<string, ExtrudeGeometry>();

export function hexGeometry(radius: number, height: number, bevel = 0.07): ExtrudeGeometry {
	const key = `${radius}|${height}|${bevel}`;
	const hit = cache.get(key);
	if (hit) return hit;
	const r = radius - bevel;
	const shape = new Shape();
	for (let i = 0; i < 6; i++) {
		const a = (i * Math.PI) / 3;
		const x = Math.sin(a) * r;
		const y = Math.cos(a) * r;
		if (i === 0) shape.moveTo(x, y);
		else shape.lineTo(x, y);
	}
	shape.closePath();
	const geometry = new ExtrudeGeometry(shape, {
		depth: height - bevel * 2,
		bevelEnabled: true,
		bevelThickness: bevel,
		bevelSize: bevel,
		bevelSegments: 3,
		curveSegments: 1
	});
	geometry.rotateX(-Math.PI / 2);
	geometry.translate(0, bevel, 0);
	geometry.computeVertexNormals();
	cache.set(key, geometry);
	return geometry;
}

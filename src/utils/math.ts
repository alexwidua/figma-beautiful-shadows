const stepped = (value: number, steps: number) =>
	Math.ceil(value / steps) * steps

const clamp = (num: number, min: number, max: number): number =>
	Math.min(Math.max(num, min), max)

const normalize = (value: number, min: number, max: number): number =>
	(value - min) / (max - min)

const vecAngle = (vec1: Vector, vec2: Vector): number =>
	Math.atan2(vec1.y - vec2.y, vec1.x - vec2.x)

const vecDistance = (vec1: Vector, vec2: Vector): number => {
	const p1 = vec2.x - vec1.x
	const p2 = vec2.y - vec1.y
	return Math.sqrt(p1 * p1 + p2 * p2)
}

export { stepped, clamp, normalize, vecAngle, vecDistance }

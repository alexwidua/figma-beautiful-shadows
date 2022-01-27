export function stepped(value: number, steps: number) {
	return Math.ceil(value / steps) * steps
}

export function clamp(num: number, min: number, max: number): number {
	return Math.min(Math.max(num, min), max)
}

export function normalize(value: number, min: number, max: number): number {
	return (value - min) / (max - min)
}

export function vecAngle(vec1: Vector, vec2: Vector): number {
	return Math.atan2(vec1.y - vec2.y, vec1.x - vec2.x)
}

export function vecDistance(vec1: Vector, vec2: Vector): number {
	const p1 = vec2.x - vec1.x
	const p2 = vec2.y - vec1.y
	return Math.sqrt(p1 * p1 + p2 * p2)
}

export function resizeCanvasElement(
	ogWidth: number,
	ogHeight: number,
	ogCornerRadius: number,
	maxWidth: number,
	maxHeight: number
) {
	const ratio = Math.min(maxWidth / ogWidth, maxHeight / ogHeight)
	return {
		width: ogWidth * ratio,
		height: ogHeight * ratio,
		cornerRadius: ogCornerRadius * ratio
	}
}

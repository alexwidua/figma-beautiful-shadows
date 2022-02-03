export function stepped(value: number, steps: number) {
	return Math.ceil(value / steps) * steps
}

export function clamp(num: number, min: number, max: number): number {
	return Math.min(Math.max(num, min), max)
}

export function normalize(value: number, min: number, max: number): number {
	return (value - min) / (max - min)
}

export function denormalize(value: number, min: number, max: number): number {
	return value * (max - min) + min
}

export function percent(value: number, roundValue: boolean = true) {
	return roundValue ? Math.round(value * 100) : value * 100
}

export function angleFromLightToTarget(vec1: Vector, vec2: Vector): number {
	const deg = Math.atan2(vec1.y - vec2.y, vec1.x - vec2.x) * (180 / Math.PI)
	return deg < 0 ? 360 + deg : deg
}

export function distanceFromLightToTarget(vec1: Vector, vec2: Vector): number {
	const p1 = vec1.x - vec2.x
	const p2 = vec1.y - vec2.y
	//return (Math.sqrt(p1 * p1 + p2 * p2) * 180) / Math.PI
	return Math.sqrt(p1 * p1 + p2 * p2)
}

export function deriveXYFromAngle(
	angle: number,
	distance: number
): { dx: number; dy: number } {
	const theta = angle * (Math.PI / 180)
	const dx = distance * Math.cos(theta)
	const dy = distance * Math.sin(theta)
	return { dx, dy }
}

export function degreeToRadian(degree: number) {
	return degree * (Math.PI / 180)
}

export function resizeAndRetainAspectRatio(
	ogWidth: number,
	ogHeight: number,
	maxWidth: number,
	maxHeight: number
) {
	const ratio = Math.min(maxWidth / ogWidth, maxHeight / ogHeight)
	return {
		width: ogWidth * ratio,
		height: ogHeight * ratio,
		ratio
	}
}

export function dottedGridOffset(viewport: number, gridSize: number): number {
	const howMuchDotsFitIntoViewport = viewport / gridSize
	const getPositionOfMostCenterDot =
		(howMuchDotsFitIntoViewport / 2) * gridSize
	const shift = viewport - getPositionOfMostCenterDot - gridSize / 2
	return shift % gridSize
}

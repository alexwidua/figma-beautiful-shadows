export function alignGridToCenter(viewport: number, gridSize: number): number {
	const howMuchGridFitsIntoViewport = viewport / gridSize
	const getPositionOfMostCenterDot =
		(howMuchGridFitsIntoViewport / 2) * gridSize
	const shift = viewport - getPositionOfMostCenterDot - gridSize / 2

	// return remainder to keep the shift motion as reduced as possible
	return Math.round(shift % gridSize)
}

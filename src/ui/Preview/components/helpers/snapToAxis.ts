import { Alignment } from '../ShowAlignmentLines/lines'

/**
 * Snap {x,y} to value if within a certain treshold.
 */
export function snapToAxis(
	x: number,
	y: number,
	snapToX: number,
	snapTo: number,
	snapTreshold: number,
	shiftPressed: boolean
): { position: Vector; snappedTo: string } {
	let position = { x, y }
	let snappedTo: Alignment = 'NONE'

	if (shiftPressed) {
		return { position, snappedTo }
	}
	const centeredX = x > snapToX - snapTreshold && x < snapToX + snapTreshold
	const centeredY = y > snapTo - snapTreshold && y < snapTo + snapTreshold
	const both = centeredX && centeredY

	if (both) {
		position = { x: snapToX, y: snapTo }
		snappedTo = 'CENTER'
	} else if (centeredX) {
		position = { x: snapToX, y }
		snappedTo = 'HORIZONTAL'
	} else if (centeredY) {
		position = { x, y: snapTo }
		snappedTo = 'VERTICAL'
	} else position = { x, y }

	return { position, snappedTo }
}

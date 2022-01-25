import { Alignment } from '../ShowAlignmentLines/lines'

export function snapTo(
	x: number,
	y: number,
	centerX: number,
	centerY: number,
	treshold: number,
	shiftPressed: boolean
): { position: Vector; snapped: string } {
	let position = { x, y }
	let snapped: Alignment = 'NONE'

	if (shiftPressed) {
		return { position, snapped }
	}
	const centeredX = x > centerX - treshold && x < centerX + treshold
	const centeredY = y > centerY - treshold && y < centerY + treshold
	const both = centeredX && centeredY

	if (both) {
		position = { x: centerX, y: centerY }
		snapped = 'CENTER'
	} else if (centeredX) {
		position = { x: centerX, y }
		snapped = 'HORIZONTAL'
	} else if (centeredY) {
		position = { x, y: centerY }
		snapped = 'VERTICAL'
	} else position = { x, y }

	return { position, snapped }
}

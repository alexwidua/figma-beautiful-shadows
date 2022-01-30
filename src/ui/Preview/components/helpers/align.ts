export type Alignment = 'NONE' | 'CENTER' | 'HORIZONTAL' | 'VERTICAL'
export default function align(
	x: number,
	y: number,
	alignX: number,
	alignY: number,
	treshold: number,
	shiftPressed: boolean
): { position: Vector; alignment: Alignment } {
	let position = { x, y }
	let alignment: Alignment = 'NONE'
	if (shiftPressed) {
		return { position, alignment }
	}
	const centeredX = x > alignX - treshold && x < alignX + treshold
	const centeredY = y > alignY - treshold && y < alignY + treshold
	const both = centeredX && centeredY
	if (both) {
		position = { x: alignX, y: alignY }
		alignment = 'CENTER'
	} else if (centeredX) {
		position = { x: alignX, y }
		alignment = 'HORIZONTAL'
	} else if (centeredY) {
		position = { x, y: alignY }
		alignment = 'VERTICAL'
	} else position = { x, y }
	return { position, alignment }
}

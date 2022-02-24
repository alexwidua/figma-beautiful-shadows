import chroma, { Color } from 'chroma-js'

export function hexToGL(color: Color | string): RGBA {
	const hexToRGBA = chroma(color).gl()
	return {
		r: hexToRGBA[0],
		g: hexToRGBA[1],
		b: hexToRGBA[2],
		a: hexToRGBA[3]
	}
}

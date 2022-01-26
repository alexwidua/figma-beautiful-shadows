import { clamp, normalize } from './math'
import { easeQuadOut } from 'd3-ease'
import chroma from 'chroma-js'

interface RGBgl {
	r: number
	g: number
	b: number
}

interface LightSource {
	intensity: number
	azimuth: number
	distance: number
	elevation: number
	tint?: RGBgl
}

interface Shadow {
	offset: Vector
	blur: number
	color: RGBgl
	opacity: number
	spread: number
}

// these values are based on trial error and gut feeling
const BASE_BLUR = 50
const BASE_OPACITY = 0.8

const getCastedShadows = ({
	intensity,
	azimuth,
	distance,
	elevation,
	tint
}: LightSource): Shadow[] => {
	// apply tinted shadow if bg color is supplied
	// s/o to https://www.joshwcomeau.com/css/designing-shadows/
	let color = [0, 0, 0]
	if (tint) {
		let hsl = chroma.gl(tint.r, tint.g, tint.b).hsl()
		// check if color has hue (ex. no white, grey, black)
		if (isNaN(hsl[0])) {
			hsl = [0, 0, 0]
		} else {
			// decrease lightness
			hsl[2] = clamp(hsl[2] - 0.8, 0.1, 1)
		}
		color = chroma.hsl(hsl[0], hsl[1], hsl[2]).gl()
	}

	const shadows: Shadow[] = Array.from({ length: intensity }, (_, i) => {
		const step = easeQuadOut(normalize(i, 0, intensity))
		const blurShadowWithDistance = clamp(distance / 100, 0.8, 5) // values are purely based on gut feel
		return {
			offset: {
				x: Math.cos(azimuth) * (distance * elevation * step),
				y: Math.sin(azimuth) * (distance * elevation * step)
			},
			blur: BASE_BLUR * blurShadowWithDistance * step * (elevation * 2),
			color: { r: color[0], g: color[1], b: color[2] },
			opacity: BASE_OPACITY - BASE_OPACITY * step,
			spread: 0
		}
	})
	return shadows
}

export { getCastedShadows }

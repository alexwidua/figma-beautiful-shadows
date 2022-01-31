import { clamp, normalize, degreeToRadian } from './math'
import { easeQuadOut } from 'd3-ease'
import chroma from 'chroma-js'
import { SHADOW_BASE_BLUR } from '../constants'

interface ShadowRecipe {
	smoothness: number
	azimuth: number
	distance: number
	elevation: number
	brightness: number
	backgroundColor: string
	size: { width: number; height: number }
}

export function getCastedShadows({
	smoothness,
	azimuth,
	distance,
	elevation,
	brightness,
	backgroundColor,
	size
}: ShadowRecipe): DropShadowEffect[] {
	// Scale shadow with object size
	const { width, height } = size
	const longestSide = Math.max(width, height)
	const factor = longestSide / 100
	const relativeDistance = distance * factor
	const azimuthRad = degreeToRadian(azimuth)

	// apply tinted shadow if bg color is supplied
	// s/o to https://www.joshwcomeau.com/css/designing-shadows/
	let color = [0, 0, 0]
	if (backgroundColor) {
		let hsl = chroma(backgroundColor).hsl()
		// check if color has hue (ex. no white, grey, black)
		if (isNaN(hsl[0])) {
			hsl = [0, 0, 0]
		} else {
			// decrease lightness
			hsl[2] = clamp(hsl[2] - 0.8, 0.1, 1)
		}
		color = chroma.hsl(hsl[0], hsl[1], hsl[2]).gl()
	}

	const shadows: DropShadowEffect[] = Array.from(
		{ length: smoothness },
		(_, i) => {
			const step = easeQuadOut(normalize(i, 0, smoothness))
			const blurShadowWithDistance = Math.max(relativeDistance / 100, 0.8) // values are purely based on gut feel
			return {
				type: 'DROP_SHADOW',
				blendMode: 'NORMAL',
				visible: true,
				color: {
					r: color[0],
					g: color[1],
					b: color[2],
					a: brightness - brightness * step
				},
				offset: {
					x:
						Math.cos(azimuthRad) *
						(relativeDistance * elevation * step),
					y:
						Math.sin(azimuthRad) *
						(relativeDistance * elevation * step)
				},
				radius:
					SHADOW_BASE_BLUR *
					blurShadowWithDistance *
					step *
					(elevation * 2),
				spread: 0
			}
		}
	)
	return shadows
}

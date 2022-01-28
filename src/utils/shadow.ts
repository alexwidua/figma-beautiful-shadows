import { clamp, normalize } from './math'
import { easeQuadOut } from 'd3-ease'
import chroma from 'chroma-js'
import { SHADOW_BASE_BLUR, SHADOW_BASE_OPACITY } from '../constants'

/**
 * Types
 */
import { Scene } from './../ui/Preview/preview'
interface SceneSetup extends Scene {
	smoothness: number
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
}: SceneSetup): DropShadowEffect[] {
	// Scale shadow distance based on object size
	const { width, height } = size
	const longestSide = Math.max(width, height)
	const factor = longestSide / 100
	const relDistance = distance * factor

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
			const blurShadowWithDistance = Math.max(relDistance / 100, 0.8) // values are purely based on gut feel
			return {
				// required for
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
					x: Math.cos(azimuth) * (relDistance * elevation * step),
					y: Math.sin(azimuth) * (relDistance * elevation * step)
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

/**
 * @file This is where the magic happens. Generate an array of shadow objects,
 * which is consumed by both the UI and canvas/main.ts.
 *
 * A lot of the values and easing is based on trial & error and gut feeling.
 * The technique of tinting the shadows is adapted from Josh W. Comeau's amazing
 * read about designing shadows in CSS: https://www.joshwcomeau.com/css/designing-shadows/
 */

import { normalize, round, degreeToRadian } from './math'
import { easeQuadOut, easeQuadIn, easeCubicInOut } from 'd3-ease'
import { SHADOW_BASE_BLUR } from '../constants'
import { ShadowType } from '../store/createShadowProps'

interface ShadowParameter {
	numShadows: number
	azimuth: number
	distance: number
	elevation: number
	brightness: number
	color: RGBA
	shadowType: ShadowType
	size: { width: number; height: number }
}

export function getCastedShadows({
	numShadows,
	azimuth,
	distance,
	elevation,
	brightness,
	color,
	shadowType,
	size
}: ShadowParameter): DropShadowEffect[] | InnerShadowEffect[] {
	const azimuthRad = degreeToRadian(azimuth)

	/**
	 * Match shadow between UI and canvas.
	 * The UI element is always 100*100px, whereas the canvas element size is indefinite.
	 * To create the same shadow offset between the UI and canvas layer, we need to scale the offset respectively.
	 */
	const { width, height } = size
	const longestSide = Math.max(width, height)
	const factor = longestSide / 100 // ui element is 100*100 by default
	const scale = distance * factor // 20 -> arbitrary value that felt good

	const increaseRadiusWithDistance = Math.max(scale / 100, 0.1) // values are purely based on gut feel

	const shadows: DropShadowEffect[] | InnerShadowEffect[] = Array.from(
		{ length: numShadows },
		(_, i) => {
			const type: any = shadowType
			// opacity/ shadow alpha
			const easeOpacity = easeCubicInOut(normalize(i, 0, numShadows))
			const a = round(brightness - brightness * easeOpacity, 2)

			// offset
			const easeOffset = easeQuadIn(normalize(i, 0, numShadows)) * 5
			const x = round(
				Math.cos(azimuthRad) * (scale * elevation * easeOffset)
			)
			const y = round(
				Math.sin(azimuthRad) * (scale * elevation * easeOffset)
			)

			// radius/ shadow blur
			const easeRadius = easeQuadOut(normalize(i, 0, numShadows))
			const radius = round(
				SHADOW_BASE_BLUR *
					increaseRadiusWithDistance *
					easeRadius *
					(elevation * 2)
			)

			return {
				type,
				blendMode: 'NORMAL',
				visible: true,
				color: { ...color, a },
				offset: {
					x,
					y
				},
				radius,
				spread: 0
			}
		}
	)
	return shadows
}

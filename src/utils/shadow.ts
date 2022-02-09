/**
 * @file This is where the magic happens. Generate an array of shadow objects,
 * which is consumed by both the UI and canvas/main.ts.
 *
 * A lot of the values and easing is based on trial & error and gut feeling.
 * The technique of tinting the shadows is adapted from Josh W. Comeau's amazing
 * read about designing shadows in CSS: https://www.joshwcomeau.com/css/designing-shadows/
 */

import { clamp, normalize, round, degreeToRadian } from './math'
import { easeQuadOut, easeQuadIn, easeCubicInOut } from 'd3-ease'
import chroma from 'chroma-js'
import { SHADOW_BASE_BLUR } from '../constants'

type RGBAArray = [number, number, number, number]
type HSLArray = [number, number, number]

interface ShadowParameter {
	numShadows: number
	azimuth: number
	distance: number
	elevation: number
	brightness: number
	backgroundColor: string
	size: { width: number; height: number }
}

export function getCastedShadows({
	numShadows,
	azimuth,
	distance,
	elevation,
	brightness,
	backgroundColor,
	size
}: ShadowParameter): DropShadowEffect[] {
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

	/**
	 * Tint shadows
	 */
	let color: RGBAArray = [0, 0, 0, 0]
	if (backgroundColor) {
		let hsl: HSLArray = chroma(backgroundColor).hsl()

		// check if color has hue (ex. no white, grey, black)
		if (isNaN(hsl[0])) hsl = [0, 0, 0]
		else hsl[2] = clamp(hsl[2] - 0.8, 0.1, 1) // decrease lightness

		color = chroma.hsl(hsl[0], hsl[1], hsl[2]).gl()
	}

	const shadows: DropShadowEffect[] = Array.from(
		{ length: numShadows },
		(_, i) => {
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
				type: 'DROP_SHADOW',
				blendMode: 'NORMAL',
				visible: true,
				color: {
					r: color[0],
					g: color[1],
					b: color[2],
					a
				},
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

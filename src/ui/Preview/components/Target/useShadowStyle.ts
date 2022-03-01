import chroma from 'chroma-js'
import useStore from '../../../../store/useStore'
import { getCastedShadows } from '../../../../utils/shadow'

const useShadow = () => {
	const { shadowType, azimuth, distance, elevation, brightness, color } =
		useStore((state) => ({
			shadowType: state.type,
			azimuth: state.preview.azimuth,
			distance: state.preview.distance,
			elevation: state.preview.elevation,
			brightness: state.preview.brightness,
			color: state.color
		}))

	const toGL = chroma(color).gl()
	const GLArray = {
		r: toGL[0],
		g: toGL[1],
		b: toGL[2],
		a: toGL[3]
	}

	const shadows = getCastedShadows({
		numShadows: 6,
		azimuth,
		distance,
		elevation,
		brightness,
		color: GLArray,
		shadowType,
		size: { width: 100, height: 100 }
	})
	const shadow = shadows.map(
		(shadow) =>
			`${shadowType === 'INNER_SHADOW' ? 'inset' : ''} ${
				shadow.offset.x
			}px ${shadow.offset.y}px ${shadow.radius}px rgba(${chroma
				.gl(
					shadow.color.r,
					shadow.color.g,
					shadow.color.b,
					shadow.color.a
				)
				.rgba()})`
	)

	return { boxShadow: shadow.toString() }
}

export default useShadow

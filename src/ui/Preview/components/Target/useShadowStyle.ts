import chroma from 'chroma-js'
import useStore from '../../../../store/useStore'
import { getCastedShadows } from '../../../../utils/shadow'

const useShadow = () => {
	const { azimuth, distance, elevation, brightness, backgroundColor } =
		useStore((state) => ({
			azimuth: state.preview.azimuth,
			distance: state.preview.distance,
			elevation: state.preview.elevation,
			brightness: state.preview.brightness,
			backgroundColor: state.preview.backgroundColor
		}))
	const shadows = getCastedShadows({
		smoothness: 6,
		azimuth,
		distance,
		elevation,
		brightness,
		backgroundColor,
		size: { width: 100, height: 100 }
	})
	const shadow = shadows.map(
		(shadow) =>
			`${shadow.offset.x}px ${shadow.offset.y}px ${
				shadow.radius
			}px ${chroma.gl(
				shadow.color.r,
				shadow.color.g,
				shadow.color.b,
				shadow.color.a
			)}`
	)

	return { boxShadow: shadow }
}

export default useShadow

import { useEffect } from 'preact/hooks'
import { useDrag } from '@use-gesture/react'
import { useSpring } from '@react-spring/web'
import useStore from '../../../../store/useStore'
import { stepped, normalize, denormalize } from '../../../../utils/math'
import { Target } from '../../../../store/createTarget'
import {
	TARGET_INITIAL_ELEVATION,
	TARGET_MIN_ELEVATION
} from '../../../../constants'

// Constants
const DRAG_RANGE = 50

const useElevationSlider = () => {
	/**
	 * 💾 Store
	 */
	const { elevation, elevationPointerDown, setTarget } = useStore(
		(state) => ({
			elevation: state.target.elevation,
			elevationPointerDown: state.target.elevationPointerDown,
			setTarget: state.setTarget
		})
	)

	/**
	 * ✋ Handle drag gesture and translation
	 */
	const [{ scale }, animate] = useSpring(() => ({ scale: 1 }))
	const slide = useDrag(
		({ down: elevationPointerDown, shiftKey, offset: [_, oy] }) => {
			const value = shiftKey ? stepped(oy, 10) : oy
			const normalized = normalize(value, DRAG_RANGE, -DRAG_RANGE)

			const data: Pick<Target, 'elevation' & 'elevationPointerDown'> = {
				elevation: normalized + TARGET_MIN_ELEVATION,
				elevationPointerDown
			}
			setTarget(data)
		},
		{
			bounds: { top: -DRAG_RANGE, bottom: DRAG_RANGE }
		}
	)

	/**
	 * 👂 Listen for position changes and fire queue translation
	 */
	useEffect(() => {
		const denormalized = denormalize(elevation, DRAG_RANGE, -DRAG_RANGE)
		const damp = 4
		const dampedDenormalized =
			normalize(denormalized, DRAG_RANGE * damp, -DRAG_RANGE * damp) +
			TARGET_INITIAL_ELEVATION
		animate.start({
			scale: dampedDenormalized,
			immediate: elevationPointerDown
		})
	}, [elevation])

	return [scale, slide]
}

export default useElevationSlider

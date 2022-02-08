import { useEffect } from 'preact/hooks'
import useStore from '../../../../store/useStore'
import { useDrag } from '@use-gesture/react'
import { useSpring } from '@react-spring/web'
import { stepped, normalize, denormalize } from '../../../../utils/math'
import { Target } from '../../../../store/createTarget'

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
				elevation: normalized,
				elevationPointerDown
			}
			setTarget(data)

			if (!elevationPointerDown && oy === DRAG_RANGE) {
				setTarget({ elevation: 0 })
			}
		},
		{
			bounds: { top: -DRAG_RANGE, bottom: DRAG_RANGE },
			from: () => [
				0,
				denormalize(
					normalize(scale.get(), 1.125, 1.375),
					DRAG_RANGE,
					-DRAG_RANGE
				)
			]
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
			0.75
		animate.start({
			scale: dampedDenormalized,
			immediate: elevationPointerDown
		})
	}, [elevation])

	return [scale, slide]
}

export default useElevationSlider

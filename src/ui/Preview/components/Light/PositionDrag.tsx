import { h } from 'preact'
import useStore from '../../../../store/useStore'
import { useRef, useEffect } from 'preact/hooks'
import { useDrag } from '@use-gesture/react'
import { useSpring, animated } from '@react-spring/web'
import { stepped } from '../../../../utils/math'
import { alignGridToCenter } from '../../../../utils/grid'
import align from '../helpers/align'
import {
	WINDOW_INITIAL_WIDTH,
	WINDOW_INITIAL_HEIGHT,
	LIGHT_SIZE,
	LIGHT_SNAP_TO_AXIS_TRESHOLD,
	GRID_SIZE
} from '../../../../constants'

// Types
import { Light } from '../../../../store/createLight'

const PositionDrag = ({
	children,
	style,
	...rest
}: {
	style?: any
	children: any
}) => {
	/**
	 * 💾 Store
	 */
	const { previewBounds, position, size, positionPointerDown, setLight } =
		useStore((state) => ({
			previewBounds: state.previewBounds,
			position: { x: state.light.x, y: state.light.y },
			size: state.light.size,
			positionPointerDown: state.light.positionPointerDown,
			setLight: state.setLight
		}))

	let prevRef = useRef(previewBounds)

	/**
	 * ✋ Handle drag gesture and translation
	 * TODO: Initial position?
	 */
	const [{ x, y }, animateLightPosition] = useSpring(() => ({
		x: WINDOW_INITIAL_WIDTH / 2 - size / 2,
		y: WINDOW_INITIAL_HEIGHT / 4 - size / 2
	}))
	const drag: any = useDrag(
		({
			down: positionPointerDown,
			shiftKey: shiftKeyDown,
			offset: [ox, oy]
		}) => {
			const alignX = previewBounds.width / 2 - size / 2
			const alignY = previewBounds.height / 2 - size / 2
			const snapToGrid = {
				x:
					stepped(ox, GRID_SIZE) -
					GRID_SIZE +
					alignGridToCenter(previewBounds.width, GRID_SIZE),
				y:
					stepped(oy, GRID_SIZE) -
					GRID_SIZE +
					alignGridToCenter(previewBounds.height, GRID_SIZE)
			}
			const value = shiftKeyDown ? snapToGrid : { x: ox, y: oy }
			const { position, alignment } = align(
				value.x,
				value.y,
				alignX,
				alignY,
				LIGHT_SNAP_TO_AXIS_TRESHOLD
			)
			const data: Pick<
				Light,
				'x' | 'y' | 'alignment' | 'positionPointerDown' | 'shiftKeyDown'
			> = {
				...position,
				alignment,
				positionPointerDown,
				shiftKeyDown
			}
			setLight(data)
		},
		{
			bounds: {
				left: 0,
				top: 0,
				right: previewBounds.width - size,
				bottom: previewBounds.height - size
			},
			from: () => [x.get(), y.get()]
		}
	)

	/**
	 * 👂 Listen for azimuth changes and update position.
	 */
	useEffect(() => {
		animateLightPosition.start({
			x: position.x,
			y: position.y,
			immediate: positionPointerDown
		})
	}, [position])

	// Keep light in bounds when resizing window
	useEffect(() => {
		if (previewBounds.width === 0 || previewBounds.height === 0) return
		const outOfBoundsX = position.x + LIGHT_SIZE > previewBounds.width
		const outOfBoundsY = position.y + LIGHT_SIZE > previewBounds.height
		if (outOfBoundsX || outOfBoundsY) {
			const x = outOfBoundsX
				? previewBounds.width - LIGHT_SIZE
				: position.x
			const y = outOfBoundsY
				? previewBounds.height - LIGHT_SIZE
				: position.y
			const data: Pick<Light, 'x' | 'y'> = { x, y }
			setLight(data)
		}
	}, [previewBounds])

	return (
		<animated.div
			style={{
				...style,
				x,
				y,
				width: size,
				height: size,
				position: 'absolute',
				zIndex: 10,
				top: 0,
				left: 0,
				touchAction: 'none'
			}}
			{...drag()}
			{...rest}>
			{children}
		</animated.div>
	)
}

export default PositionDrag

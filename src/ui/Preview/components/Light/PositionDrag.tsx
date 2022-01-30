import { h } from 'preact'
import useStore from '../../../../store/useStore'
import { useEffect } from 'preact/hooks'
import { useDrag } from '@use-gesture/react'
import { useSpring, animated } from '@react-spring/web'
import align from '../helpers/align'
import {
	WINDOW_INITIAL_WIDTH,
	WINDOW_INITIAL_HEIGHT,
	LIGHT_SNAP_TO_AXIS_TRESHOLD
} from '../../../../constants'

// Types
import { Light } from '../../../../store/createLight'

const PositionDrag = ({ children, ...rest }: { children: any }) => {
	/**
	 * 💾 Store
	 */
	const { previewBounds, size, position, positionPointerDown, setLight } =
		useStore((state: any) => ({
			previewBounds: state.previewBounds,
			size: state.light.size,
			position: { x: state.light.x, y: state.light.y },
			positionPointerDown: state.light.positionPointerDown,
			setLight: state.setLight
		}))

	/**
	 * ✋ Handle drag gesture and translation
	 * TODO: Initial position?
	 */
	const [{ x, y }, animateLightPosition] = useSpring(() => ({
		x: WINDOW_INITIAL_WIDTH / 2 - size / 2,
		y: WINDOW_INITIAL_HEIGHT / 4 - size / 2
	}))
	const drag: any = useDrag(
		({ down: positionPointerDown, shiftKey, offset: [ox, oy] }) => {
			const alignX = previewBounds.width / 2 - size / 2
			const alignY = previewBounds.height / 2 - size / 2
			const value = { x: ox, y: oy }
			const { position, alignment } = align(
				value.x,
				value.y,
				alignX,
				alignY,
				LIGHT_SNAP_TO_AXIS_TRESHOLD,
				shiftKey
			)
			const data: Partial<Light> = {
				...position,
				alignment,
				positionPointerDown
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
	 * 👂 Listen for position changes and fire queue translation
	 */
	useEffect(() => {
		animateLightPosition.start({
			x: position.x,
			y: position.y,
			immediate: positionPointerDown
		})
	}, [position])

	// Keep light in bounds when window is resized
	useEffect(() => {
		const { width, height } = previewBounds
		if (!width || !height) return
		const OOBx = x.get() > width - size
		const OOBy = y.get() > height - size
		let position
		const padding = 8
		if (OOBx && OOBy)
			position = { x: width - size - padding, y: height - size - padding }
		else if (OOBx) position = { x: width - size - padding }
		else if (OOBy) position = { y: height - size - padding }
		if (position) setLight(position)
	}, [previewBounds])

	return (
		<animated.div
			style={{
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

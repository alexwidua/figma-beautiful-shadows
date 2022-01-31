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
	const {
		previewBounds,
		azimuth,
		distance,
		size,
		positionPointerDown,
		setLight
	} = useStore((state) => ({
		previewBounds: state.previewBounds,
		azimuth: state.preview.azimuth,
		distance: state.preview.distance,
		size: state.light.size,
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
	 * 👂 Listen for azimuth changes and update position.
	 *
	 * Instead of listening to position updates and take the raw X and Y value,
	 * we listen to azimuth changes and derive the x and y value.
	 * This allows us to adjust the x and y position externally by just changing the azimuth value.
	 */
	useEffect(() => {
		const theta = azimuth * (Math.PI / 180)
		const dx = distance * Math.cos(theta)
		const dy = distance * Math.sin(theta)
		const adjustedX = previewBounds.width / 2 - size / 2 - dx
		const adjustedY = previewBounds.height / 2 - size / 2 - dy

		animateLightPosition.start({
			x: adjustedX,
			y: adjustedY,
			immediate: positionPointerDown
		})
	}, [azimuth, distance])

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

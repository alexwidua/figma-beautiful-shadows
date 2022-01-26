/**
 * @file Light source component that can be dragged around the canvas.
 *
 * It emits four values to its parent scene component:
 * @x @y Used to calculate the azimuth and distance to the shadow-receiving target element.
 * @alignment Is the light currently aligned to any axis
 * @pointerDown Is the light currently being clicked (ex. used to show the alignment helper lines)
 */

import { h, Ref } from 'preact'
import { useMemo, useEffect } from 'preact/hooks'
import { PreviewBounds } from '../../../../hooks/usePreviewBounds'
import { useDrag } from '@use-gesture/react'
import { useSpring, animated } from '@react-spring/web'
import { throttle } from '../../../../utils/throttle'
import { THROTTLE_SCENE_UPDATES } from '../../preview'
import { snapToAxis } from '../helpers/snapToAxis'
import styles from './light.css'

/**
 * Types
 */
import { Alignment } from '../ShowAlignmentLines/lines'

export interface LightValues {
	x: number
	y: number
	alignment: Alignment
	pointerDown: boolean
}

export interface LightProps {
	size: number
	bounds: Ref<any>
	preview: PreviewBounds
	onLightChange: Function
}

/**
 * Constants
 */

const SNAP_TO_CENTER_TRESHOLD = 6 //px

const Light = ({
	size = 24,
	bounds,
	preview,
	onLightChange,
	...rest
}: LightProps) => {
	const { vw, vh } = preview

	/**
	 * Handle animation and drag logic
	 */
	const [{ x, y }, animate] = useSpring(() => ({ x: 0, y: 0 }))
	const drag: any = useDrag(
		({ down, shiftKey, offset: [ox, oy] }) => {
			const snapToX = vw / 2 - size / 2
			const snapToY = vh / 2 - size / 2

			const { position, snappedTo } = snapToAxis(
				ox,
				oy,
				snapToX,
				snapToY,
				SNAP_TO_CENTER_TRESHOLD,
				shiftKey
			)
			animate.set(position)
			throttledLightChange(position, snappedTo, down)
		},
		{
			bounds: bounds,
			from: () => [x.get(), y.get()]
		}
	)

	/**
	 * Emit light source changes to parent scene component
	 */
	const handleLightChange = (
		position: Vector,
		alignment: Alignment = 'NONE',
		pointerDown: boolean = false
	) => {
		const { x, y } = position
		const data: LightValues = { x, y, alignment, pointerDown }
		onLightChange(data)
	}

	const throttledLightChange: Function = useMemo(
		() => throttle(handleLightChange, THROTTLE_SCENE_UPDATES),
		[vw, vh]
	)

	/**
	 * 1. Update light source when plugin window is resized.
	 * 2. Keep light source in bounds when plugin window is resized.
	 */
	useEffect(() => {
		handleLightChange({ x: x.get(), y: y.get() })
	}, [vw, vh])

	useEffect(() => {
		if (vw === 0 || vh === 0) return
		const padding = 8
		if (x.get() > preview.vw - size) {
			animate.start({ x: vw - size - padding })
		}
		if (y.get() > preview.vh - size) {
			animate.start({ y: vh - size - padding })
		}
	}, [preview])

	return (
		<animated.div
			class={styles.light}
			style={{ x, y }}
			{...drag()}
			{...rest}
		/>
	)
}

export default Light

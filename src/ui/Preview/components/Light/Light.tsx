import { h, Ref } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { useDrag } from '@use-gesture/react'
import { useSpring, animated } from '@react-spring/web'
import { PreviewBounds } from '../../../../hooks/usePreviewBounds'
import { snapTo } from '../helpers/snap'

import styles from './light.css'

interface LightInputProps {
	size: number
	bounds: Ref<any>
	onLightInputDrag: Function
	preview: PreviewBounds
}

const SNAP_TO_CENTER_TRESHOLD = 6

const LightInput = ({
	size = 24,
	bounds,
	onLightInputDrag,
	preview,
	...rest
}: LightInputProps) => {
	const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }))

	const drag: any = useDrag(
		({ down, shiftKey, offset: [ox, oy] }) => {
			// snap to horizontal and vertical axis
			const snapToX = preview.vw / 2 - size / 2
			const snapToY = preview.vh / 2 - size / 2

			const { position, snapped } = snapTo(
				ox,
				oy,
				snapToX,
				snapToY,
				SNAP_TO_CENTER_TRESHOLD,
				shiftKey
			)
			api.set(position)
			onLightInputDrag(position, snapped, down)
		},
		{
			bounds: bounds,
			from: () => [x.get(), y.get()]
		}
	)

	/**
	 * Keep light source in bounds when plugin viewport is resized
	 */
	useEffect(() => {
		if (preview.vw === 0 || preview.vh === 0) return
		const padding = 8
		if (x.get() > preview.vw - size) {
			api.start({ x: preview.vw - size - padding })
		}
		if (y.get() > preview.vh - size) {
			api.start({ y: preview.vh - size - padding })
		}
	}, [preview])

	return <animated.div class={styles.light} style={{ x, y }} {...drag()} />
}

export default LightInput

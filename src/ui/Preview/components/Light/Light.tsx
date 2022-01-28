/**
 * @file Light source component that dictates the casted shadow.
 *
 * It emits four values to its parent scene component:
 * @x @y Used to calculate the azimuth and distance to the shadow-receiving target element.
 * @brightness Used to calculate the shadow opacity
 * @alignment Is the light currently aligned to any axis
 * @pointerDown Is the light currently being clicked (ex. used to show the alignment helper lines)
 */

import { h, Ref } from 'preact'
import { useMemo, useEffect, useState } from 'preact/hooks'
import { PreviewBounds } from '../../../../hooks/usePreviewBounds'
import { useDrag } from '@use-gesture/react'
import { useSpring, animated } from '@react-spring/web'
import { throttle } from '../../../../utils/throttle'
import { snapToAxis } from '../helpers/snapToAxis'
import { stepped, normalize, clamp } from '../../../../utils/math'
import Badge from '../Badge/badge'
import styles from './light.css'

import {
	WINDOW_INITIAL_WIDTH,
	WINDOW_INITIAL_HEIGHT,
	THROTTLE_SCENE_UPDATES,
	PREVIEW_SNAP_ALIGN_TRESHOLD,
	LIGHT_INITIAL_BRIGHTNESS,
	LIGHT_MIN_BRIGHTNESS
} from '../../../../constants'

/**
 * Types
 */
import { Alignment } from '../ShowAlignmentLines/lines'

export interface LightValues {
	x: number
	y: number
	brightness?: number
	alignment: Alignment
	pointerDown: boolean
}
export interface LightProps {
	size: number
	bounds: Ref<any>
	preview: PreviewBounds
	onPositionChange: Function
	onBrightnessChange: Function
}

const Light = ({
	size = 24,
	bounds,
	preview,
	onPositionChange,
	onBrightnessChange,
	...rest
}: LightProps) => {
	const { vw, vh } = preview

	/**
	 * Light position drag.
	 * The 'sun' can be dragged around the preview to change the light source's
	 * position and subsequently the angle and distance of the casted shadow.
	 *
	 * Additionally to updating the light position, on every drag we check
	 * if the light can snap to the center, x or y axis.
	 */
	const [positionDragDown, setPositionDragDown] = useState(false)
	const [{ x, y }, animateLightPosition] = useSpring(() => ({
		x: WINDOW_INITIAL_WIDTH / 2 - size / 2,
		y: WINDOW_INITIAL_HEIGHT / 4 - size / 2
	}))
	const dragLightPosition: any = useDrag(
		({ down, shiftKey, offset: [ox, oy] }) => {
			const snapToX = vw / 2 - size / 2
			const snapToY = vh / 2 - size / 2

			const { position, snappedTo } = snapToAxis(
				ox,
				oy,
				snapToX,
				snapToY,
				PREVIEW_SNAP_ALIGN_TRESHOLD,
				shiftKey
			)

			animateLightPosition.set(position)
			throttledPositionChange(position, snappedTo, down)
			setPositionDragDown(down)
		},
		{
			bounds: bounds,
			from: () => [x.get(), y.get()]
		}
	)

	const handlePositionChange = (
		position: Vector,
		alignment: Alignment = 'NONE',
		pointerDown: boolean = false
	) => {
		const { x, y } = position
		const data: LightValues = { x, y, alignment, pointerDown }
		onPositionChange(data)
	}

	const throttledPositionChange: Function = useMemo(
		() => throttle(handlePositionChange, THROTTLE_SCENE_UPDATES),
		[vw, vh]
	)

	/**
	 * 1. Update light source when plugin window is resized.
	 * 2. Keep light source in bounds when plugin window is resized.
	 */
	useEffect(() => {
		handlePositionChange({ x: x.get(), y: y.get() })
	}, [vw, vh])

	useEffect(() => {
		if (!vw || !vh) return
		const padding = 8
		if (x.get() > preview.vw - size) {
			animateLightPosition.start({ x: vw - size - padding })
		}
		if (y.get() > preview.vh - size) {
			animateLightPosition.start({ y: vh - size - padding })
		}
	}, [preview])

	/**
	 * Brightness drag.
	 * When the light element is hovered, a small handle appears that can be
	 * dragged to change the light's brightness (-> shadow's opacity).
	 */
	const brightnessDragMin = 0
	const brightnessDragMax = -20
	const sunRayMinWidth = 4
	const sunRayMaxWidth = 16
	const sunRayRadius = 24
	const opacity_min = 0.4
	const opacity_max = 1

	const [brightness, setBrightness] = useState(LIGHT_INITIAL_BRIGHTNESS)
	const [brightnessDragDown, setBrightnessDragDown] = useState(false)

	const [
		{ translateSliderY, opacity, translateSunRays, sunRayWidth },
		animateSlider
	] = useSpring(() => ({
		translateSliderY: brightnessDragMax * LIGHT_INITIAL_BRIGHTNESS,
		opacity: opacity_min,
		translateSunRays: sunRayRadius * 1.5,
		sunRayWidth: sunRayMaxWidth * LIGHT_INITIAL_BRIGHTNESS
	}))

	const dragBrightness: any = useDrag(
		({ event, down, shiftKey, offset: [_, oy] }) => {
			event.stopPropagation()
			const value = shiftKey ? oy : stepped(oy, 2)
			setBrightnessDragDown(down)
			const normalized = Math.min(
				normalize(value, brightnessDragMin, brightnessDragMax) +
					LIGHT_MIN_BRIGHTNESS,
				1
			)
			const clamped = clamp(normalized, opacity_min, opacity_max)
			animateSlider.set({
				translateSliderY: oy,
				opacity: clamped,
				translateSunRays: Math.abs(oy) + sunRayRadius,
				sunRayWidth: clamp(Math.abs(oy), sunRayMinWidth, sunRayMaxWidth)
			})
			setBrightness(normalized)
			throttledBrightnessChange(normalized)
		},
		{
			bounds: { bottom: brightnessDragMin, top: brightnessDragMax },
			from: () => [translateSliderY.get(), translateSliderY.get()]
		}
	)

	// Show a few sunrays that visualize the current brightness value during drag.
	const sunRayNum = 8
	const sunRays = Array.from({ length: sunRayNum }, (el, i) => {
		const deg = -90 + (360 / sunRayNum) * i
		return (
			<animated.span
				style={{
					opacity: brightnessDragDown ? 1 : 0,
					position: 'absolute',
					left: '50%',
					top: '50%',
					width: sunRayWidth,
					height: 2,
					borderRadius: 1,
					background: 'var(--color-blue)',
					transform: `translateY(-50%) translateX(-50%) rotate(${deg}deg)`,
					translate: translateSunRays
				}}
			/>
		)
	})

	const throttledBrightnessChange: Function = useMemo(
		() => throttle(onBrightnessChange, THROTTLE_SCENE_UPDATES),
		[vw, vh]
	)

	return (
		<animated.div
			className={styles.light}
			style={{ x, y, width: size, height: size }}
			{...dragLightPosition()}
			{...rest}>
			<animated.div
				className={styles.glow}
				style={{
					opacity
				}}
			/>
			{sunRays}
			<div className={styles.showSliderOnHover} />
			<div className={styles.slider}>
				<animated.div
					className={styles.handle}
					data-down={brightnessDragDown}
					style={{
						transform: 'translate(-50%)',
						translateY: translateSliderY,
						opacity: positionDragDown ? 0 : 1
					}}
					{...dragBrightness()}>
					<Badge
						style={{
							position: 'absolute',
							top: 0,
							left: '50%',
							transform: 'translate3d(-50%, -32px, 0)',
							opacity: brightnessDragDown ? 1 : 0
						}}>
						Brightness {Math.round(brightness * 100)}%
					</Badge>
				</animated.div>
			</div>
			<div className={styles.body} />
		</animated.div>
	)
}

export default Light

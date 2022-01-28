import { h, Fragment } from 'preact'
import { useState, useMemo, useEffect } from 'preact/hooks'
import { useDrag } from '@use-gesture/react'
import { useSpring, animated, to } from '@react-spring/web'
import { getCastedShadows } from '../../../../utils/shadow'
import { throttle } from '../../../../utils/throttle'
import { stepped, normalize, resizeCanvasElement } from '../../../../utils/math'
import chroma from 'chroma-js'
import Badge from '../Badge/badge'
import styles from './target.css'

import { THROTTLE_SCENE_UPDATES } from '../../../../constants'

/**
 * Types
 */
import { SelectionParameters } from '../../../../main'
export interface TargetValues {
	x: number
	y: number
	elevation: number
}

interface TargetProps {
	preview: any
	canvasSelection: SelectionParameters
	scene: any
	dragRange: number
	initElevation: number
	minElevation: number
	onTargetChange: Function
}

const Target = ({
	preview,
	canvasSelection,
	scene,
	dragRange = 50,
	initElevation = 0.5,
	minElevation = 0.025,
	onTargetChange,
	...rest
}: TargetProps) => {
	const [elevationBadge, setElevationBadge] = useState({
		value: 0,
		visible: false
	})
	const { vw, vh } = preview

	/**
	 * Handle animation and drag logic.
	 * We assume that the target element is always centered
	 */
	const x = vw / 2
	const y = vh / 2
	const [{ scale }, animate] = useSpring(() => ({ scale: 1 }))
	const dragY = useDrag(
		({ down, shiftKey, offset: [_, oy] }) => {
			const value = shiftKey ? oy : stepped(oy, 10)
			const normalizedElevation = normalize(value, dragRange, -dragRange)

			// Damp the scale value to avoid the element scaling super tiny or large
			const damp = 4
			const normalizedDampedElevation =
				normalize(value, dragRange * damp, -dragRange * damp) +
				initElevation

			animate.start({
				scale: normalizedDampedElevation,
				immediate: down
			})

			throttledTargetChange(x, y, normalizedElevation + minElevation)
			setElevationBadge({ value: normalizedElevation, visible: down })
		},
		{
			bounds: { top: -dragRange, bottom: dragRange },
			from: () => [
				initElevation + minElevation * dragRange,
				initElevation + minElevation * dragRange
			]
		}
	)

	/**
	 * Emit target elevation changes to parent scene component
	 */
	const handleTargetChange = (x: number, y: number, elevation: number) => {
		const data: TargetValues = { x, y, elevation }
		onTargetChange(data)
	}

	const throttledTargetChange: Function = useMemo(
		() => throttle(handleTargetChange, THROTTLE_SCENE_UPDATES),
		[vw, vh]
	)

	useEffect(() => {
		handleTargetChange(x, y, elevation)
	}, [vw, vh])

	/**
	 * Calculate shadows
	 */
	const { azimuth, distance, elevation, brightness, backgroundColor } = scene
	const shadows = getCastedShadows({
		smoothness: 6,
		azimuth,
		distance,
		elevation,
		brightness,
		backgroundColor,
		size: { width: 100, height: 100 }
	})

	const shadowStyles = shadows.map(
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

	/**
	 * Style element depending on different selection states
	 */
	const { state, width, height, cornerRadius } = canvasSelection
	const selected = state === 'VALID'

	const targetSize = resizeCanvasElement(
		width,
		height,
		cornerRadius,
		100,
		100
	)

	const selectionStyles = {
		border: selected
			? '1px solid var(--color-blue)'
			: '1px solid rgba(0,0,0,0.2)',
		width: targetSize.width || 100,
		height: targetSize.height || 100,
		borderRadius: targetSize.cornerRadius || 4
	}

	return (
		<Fragment>
			<Badge
				visible={elevationBadge.visible}
				style={{
					position: 'absolute',
					left: '50%',
					top: '50%',
					transform: 'translate3d(-50%, 76px, 0)',
					boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.4)'
				}}>
				Elevation {Math.round(elevationBadge.value * 100)}%
			</Badge>
			<animated.div
				className={styles.target}
				style={{
					...selectionStyles,
					boxShadow: shadowStyles.toString(),
					transform: 'translate3d(-50%,-50%,0)',
					scale: to([scale], (s) => s)
				}}
				{...dragY()}
				{...rest}
			/>
		</Fragment>
	)
}

export default Target

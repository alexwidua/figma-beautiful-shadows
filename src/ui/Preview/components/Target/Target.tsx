import { h, Fragment } from 'preact'
import { useState, useMemo, useEffect } from 'preact/hooks'
import { stepped, normalize } from '../../../../utils/math'
import { useDrag } from '@use-gesture/react'
import { useSpring, animated, to } from '@react-spring/web'
import chroma from 'chroma-js'
import { getCastedShadows } from '../../../../utils/shadow'
import styles from './target.css'
import { throttle } from '../../../../utils/throttle'
import { THROTTLE_SCENE_UPDATES } from '../../preview'

export interface TargetValues {
	x: number
	y: number
	elevation: number
}

interface TargetProps {
	preview: any
	scene: any
	elevation: number
	dragRange: number
	initElevation: number
	minElevation: number
	onTargetChange: Function
}

const Target = ({
	preview,
	scene,
	elevation,
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
	const tint = chroma(scene.backgroundColor).gl()

	const { azimuth, distance } = scene
	const shadows = getCastedShadows({
		intensity: 6,
		azimuth,
		distance,
		elevation,
		tint: { r: tint[0], g: tint[1], b: tint[2] }
	})

	const shadowStyles = shadows.map(
		(shadow) =>
			`${shadow.offset.x}px ${shadow.offset.y}px ${
				shadow.blur
			}px ${chroma.gl(
				shadow.color.r,
				shadow.color.g,
				shadow.color.b,
				shadow.opacity
			)}`
	)

	return (
		<Fragment>
			<div
				className={styles.badge}
				style={{ opacity: elevationBadge.visible ? 1 : 0 }}>
				Elevation {Math.round(elevationBadge.value * 100)}%
			</div>
			<animated.div
				className={styles.target}
				style={{
					boxShadow: shadowStyles.toString(),
					transform: 'translate3d(-50%,-50%,0)',
					scale: to([scale], (s) => s)
				}}
				{...dragY()}
			/>
		</Fragment>
	)
}

export default Target

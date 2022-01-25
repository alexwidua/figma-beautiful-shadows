import { h, Fragment } from 'preact'
import { useState } from 'preact/hooks'
import { normalize } from '../../../../utils/math'
import { useDrag } from '@use-gesture/react'
import { useSpring, animated, to } from '@react-spring/web'
import chroma from 'chroma-js'
import { getCastedShadows } from '../../../../utils/shadow'
import styles from './target.css'
import useDebounce from '../../../../hooks/useDebounce'

interface TargetProps {
	dragRange: number
	initElevation: number
	minElevation: number
	light: any
	style?: any
	onVerticalDrag: Function
}

const Target = ({
	dragRange = 50,
	initElevation = 0.5,
	minElevation = 0.025,
	light,
	style,
	onVerticalDrag,
	...rest
}: TargetProps) => {
	const [showElevationBadge, setShowElevationBadge] = useState(false)
	const [elevation, setElevation] = useState(initElevation)
	const [{ scale }, api] = useSpring(() => ({ scale: 1 }))

	const dragY = useDrag(
		({ down, shiftKey, offset: [_, oy] }) => {
			const value = shiftKey ? oy : Math.ceil(oy / 10) * 10
			const normalizedElevation = normalize(value, dragRange, -dragRange)

			// Damp the scale value to avoid the element scaling super tiny or large
			const damp = 4
			const normalizedDampedElevation =
				normalize(value, dragRange * damp, -dragRange * damp) +
				initElevation

			api.start({
				scale: normalizedDampedElevation,
				immediate: down
			})
			onVerticalDrag(normalizedElevation + minElevation)
			setElevation(normalizedElevation)
			setShowElevationBadge(down)
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
	 * ...there must be shadow.
	 */
	const tint = chroma(light.tint).gl()
	const shadows = getCastedShadows({
		intensity: 6,
		azimuth: light.azimuth,
		distance: light.distance,
		elevation: light.targetElevation,
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
				class={styles.badge}
				style={{ opacity: showElevationBadge ? 1 : 0 }}>
				Elevation {Math.round(elevation * 100)}%
			</div>
			<animated.div
				class={styles.target}
				style={{
					boxShadow: shadowStyles,
					transform: 'translate3d(-50%,-50%,0)',
					scale: to([scale], (s) => s)
				}}
				{...dragY()}
			/>
		</Fragment>
	)
}

export default Target

import { h, Fragment } from 'preact'
import useStore from '../../../../store/useStore'
import { useEffect } from 'preact/hooks'
import { useDrag } from '@use-gesture/react'
import { useSpring, animated } from '@react-spring/web'
import { stepped, normalize, denormalize, clamp } from '../../../../utils/math'
import styles from './brightness-slider.css'
import {
	LIGHT_INITIAL_BRIGHTNESS,
	LIGHT_MIN_BRIGHTNESS
} from '../../../../constants'

// Types
import { Light } from '../../../../store/createLight'

/**
 * Constants
 */
const brightnessDragMin = 0
const brightnessDragMax = -20
const sunRayMinWidth = 4
const sunRayMaxWidth = 16
const sunRayThickness = 1
const sunRayRadius = 24
const opacity_min = 0.4
const opacity_max = 1

const BrightnessSlider = ({ children }: { children: any }) => {
	/**
	 * 💾 Store
	 */
	const { brightness, positionPointerDown, brightnessPointerDown, setLight } =
		useStore((state) => ({
			brightness: state.light.brightness,
			positionPointerDown: state.light.positionPointerDown,
			brightnessPointerDown: state.light.brightnessPointerDown,
			setLight: state.setLight
		}))

	const [{ y, opacity, translateSunRays, sunRayWidth }, animateSlider] =
		useSpring(() => ({
			y: brightnessDragMax * LIGHT_INITIAL_BRIGHTNESS,
			opacity: opacity_min,
			translateSunRays: sunRayRadius * 1.5,
			sunRayWidth: sunRayMaxWidth * LIGHT_INITIAL_BRIGHTNESS
		}))
	const slide: any = useDrag(
		({ event, down: brightnessPointerDown, shiftKey, offset: [_, oy] }) => {
			event.stopPropagation()
			const value = shiftKey ? oy : stepped(oy, 2)
			const normalized = Math.min(
				normalize(value, brightnessDragMin, brightnessDragMax) +
					LIGHT_MIN_BRIGHTNESS,
				1
			)
			const data: Partial<Light> = {
				brightness: normalized,
				brightnessPointerDown
			}
			setLight(data)
		},
		{
			bounds: { bottom: brightnessDragMin, top: brightnessDragMax },
			from: () => [y.get(), y.get()]
		}
	)

	useEffect(() => {
		const denormalized = denormalize(
			brightness,
			brightnessDragMin,
			brightnessDragMax
		)
		animateSlider.set({
			y: denormalized,
			opacity: clamp(brightness, opacity_min, opacity_max),
			translateSunRays: Math.abs(denormalized) + sunRayRadius,
			sunRayWidth: clamp(
				Math.abs(denormalized),
				sunRayMinWidth,
				sunRayMaxWidth
			)
		})
	}, [brightness])

	// Show a few sunrays that visualize the current brightness value during drag.
	const sunRayNum = 8
	const sunRays = Array.from({ length: sunRayNum }, (el, i) => {
		const deg = -90 + (360 / sunRayNum) * i
		return (
			<animated.span
				style={{
					opacity: brightnessPointerDown ? 1 : 0,
					position: 'absolute',
					left: '50%',
					top: '50%',
					width: sunRayWidth,
					height: sunRayThickness,
					borderRadius: 1,
					background: 'var(--color-blue)',
					transform: `translateY(-50%) translateX(-50%) rotate(${deg}deg)`,
					translate: translateSunRays
				}}
			/>
		)
	})

	return (
		<Fragment>
			<animated.div
				className={styles.glow}
				style={{
					opacity
				}}
			/>
			{sunRays}
			<div className={styles.hover} />
			<div className={styles.slider}>
				<animated.div
					className={styles.handle}
					data-down={brightnessPointerDown}
					style={{
						opacity: positionPointerDown ? 0 : 1,
						transform: 'translate(-50%)',
						y
					}}
					{...slide()}>
					{children}
				</animated.div>
			</div>
		</Fragment>
	)
}

export default BrightnessSlider

import { h } from 'preact'
import { forwardRef } from 'preact/compat'
import useStore from '../../store/useStore'
import { useEffect, useLayoutEffect } from 'preact/hooks'
import usePreviewBounds, { PreviewBounds } from '../../hooks/usePreviewBounds'
import {
	angleFromLightToTarget,
	distanceFromLightToTarget
} from '../../utils/math'
import { alignGridToCenter } from '../../utils/grid'
import Target from './components/Target/target'
import Light from './components/Light'
import ShowAlignmentLines from './components/ShowAlignmentLines/lines'
import {
	BACKGROUND_DEFAULT_COLOR,
	GRID_SIZE,
	GRID_OPACITY
} from '../../constants'
import styles from './preview.css'

// Types
import { Preview } from '../../store/createPreview'

const Preview = forwardRef<any>(({ children }: any, ref) => {
	const { width, height }: PreviewBounds = usePreviewBounds(ref)
	useEffect(() => {
		setPreviewBounds({ width, height })
	}, [width, height])

	/**
	 * 💾 Store
	 */
	const {
		light,
		target,
		background,
		positionPointerDown,
		shiftKeyDown,
		setPreview,
		setPreviewBounds
	} = useStore((state) => ({
		light: state.light,
		target: state.target,
		background: state.background,
		positionPointerDown: state.light.positionPointerDown,
		shiftKeyDown: state.light.shiftKeyDown,
		setPreview: state.setPreview,
		setPreviewBounds: state.setPreviewBounds
	}))
	const backgroundColor =
		background.preference === 'NONE'
			? BACKGROUND_DEFAULT_COLOR
			: background.preference === 'AUTO'
			? background.auto
			: background.custom

	/**
	 * 👂 Listen for changes from the Light or Target component and update the preview
	 */
	useEffect(() => {
		const targetPosition = {
			// assume that target is always centered
			x: width / 2 - light.size / 2,
			y: height / 2 - light.size / 2
		}
		const lightPosition = { x: light.x, y: light.y }
		const azimuth = angleFromLightToTarget(targetPosition, lightPosition)
		const distance = distanceFromLightToTarget(
			targetPosition,
			lightPosition
		)
		const elevation = target.elevation
		const brightness = light.brightness

		const update: Preview = {
			azimuth,
			distance,
			elevation,
			brightness,
			backgroundColor
		}
		setPreview(update)
	}, [light, target, background])

	/**
	 * Show grid
	 */
	const grid = {
		backgroundImage: `radial-gradient(rgba(0,0,0,${
			shiftKeyDown ? (positionPointerDown ? GRID_OPACITY : 0) : 0
		}) 1px, transparent 0)`,
		backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
		backgroundPosition: `${alignGridToCenter(
			width,
			GRID_SIZE
		)}px ${alignGridToCenter(height, GRID_SIZE)}px`
	}

	return (
		<div
			ref={ref}
			className={styles.preview}
			style={{
				backgroundColor,
				...grid
			}}>
			<Target />
			<Light />
			<ShowAlignmentLines />
			{children}
		</div>
	)
})

export default Preview

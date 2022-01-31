import { h } from 'preact'
import { forwardRef } from 'preact/compat'
import useStore from '../../store/useStore'
import { useEffect, useLayoutEffect } from 'preact/hooks'
import usePreviewBounds, { PreviewBounds } from '../../hooks/usePreviewBounds'
import {
	angleFromLightToTarget,
	distanceFromLightToTarget
} from '../../utils/math'
import Target from './components/Target/target'
import Light from './components/Light'
import ShowAlignmentLines from './components/ShowAlignmentLines/lines'
import { BACKGROUND_DEFAULT_COLOR } from '../../constants'
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
	const { light, target, background, setPreview, setPreviewBounds } =
		useStore((state) => ({
			light: state.light,
			target: state.target,
			background: state.background,
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
			x: target.x - light.size / 2,
			y: target.y - light.size / 2
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

	return (
		<div ref={ref} className={styles.preview} style={{ backgroundColor }}>
			<Target />
			<Light />
			<ShowAlignmentLines />
			{children}
		</div>
	)
})

export default Preview

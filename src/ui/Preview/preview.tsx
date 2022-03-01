import { h } from 'preact'
import { useEffect, useCallback } from 'preact/hooks'
import usePreviewBounds, { PreviewBounds } from '../../hooks/usePreviewBounds'
import { forwardRef } from 'preact/compat'
import useStore from '../../store/useStore'
import { emit } from '@create-figma-plugin/utilities'
import { debounce } from '../../utils/debounce'
import {
	angleFromLightToTarget,
	distanceFromLightToTarget
} from '../../utils/math'
import { alignGridToCenter } from '../../utils/grid'
import Target from './components/Target/target'
import Light from './components/Light'
import ShowAlignmentLines from './components/ShowAlignmentLines/lines'
import styles from './preview.css'

// Constants
import {
	DEBOUNCE_CANVAS_UPDATES,
	GRID_SIZE,
	GRID_OPACITY
} from '../../constants'

// Types
import { Preview } from '../../store/createPreview'
import { PluginData } from '../../main'

const Preview = forwardRef<any>(({ children }: any, ref) => {
	const { width, height }: PreviewBounds = usePreviewBounds(ref)
	useEffect(() => {
		setPreviewBounds({ width, height })
	}, [width, height])

	/**
	 * 💾 Store
	 */
	const {
		type,
		color,
		backgroundColor,
		light,
		target,
		selection,
		previewBounds,
		positionPointerDown,
		shiftKeyDown,
		setPreview,
		setPreviewBounds
	} = useStore((state) => ({
		color: state.color,
		type: state.type,
		backgroundColor: state.preview.backgroundColor,
		light: state.light,
		target: state.target,
		selection: state.selection,
		previewBounds: state.previewBounds,
		positionPointerDown: state.light.positionPointerDown,
		shiftKeyDown: state.light.shiftKeyDown,
		setPreview: state.setPreview,
		setPreviewBounds: state.setPreviewBounds
	}))

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
		const shadowColor = color
		const shadowType = type

		const update: Preview = {
			azimuth,
			distance,
			elevation,
			brightness,
			shadowColor,
			shadowType
		}
		setPreview(update)

		const pluginData: PluginData = {
			...update,
			lightPosition,
			previewBounds
		}
		debounceCanvasUpdate(pluginData)
	}, [light, target, color, type, selection, previewBounds])

	const debounceCanvasUpdate = useCallback(
		debounce(
			(data) => emit('UPDATE_SHADOWS', data),
			DEBOUNCE_CANVAS_UPDATES
		),
		[]
	)

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

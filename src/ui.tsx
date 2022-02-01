import { h } from 'preact'
import useStore from './store/useStore'
import { useRef, useEffect, useCallback } from 'preact/hooks'
import { emit, on } from '@create-figma-plugin/utilities'
import { useWindowResize, render } from '@create-figma-plugin/ui'
import { debounce } from './utils/debounce'
import { deriveXYFromAngle } from './utils/math'
import chroma from 'chroma-js'
import PreviewEditor from './ui/Preview/preview'
import Menu from './ui/Menu/menu'
import {
	DEBOUNCE_CANVAS_UPDATES,
	WINDOW_INITIAL_WIDTH,
	WINDOW_INITIAL_HEIGHT,
	WINDOW_MIN_WIDTH,
	WINDOW_MAX_WIDTH,
	WINDOW_MIN_HEIGHT,
	WINDOW_MAX_HEIGHT,
	BACKGROUND_DEFAULT_COLOR
} from './constants'

// Types
import { Light } from './store/createLight'
import { Target } from './store/createTarget'
import { Background } from './store/createBackground'
import { Selection } from './store/createSelection'
import { Preview } from './store/createPreview'

const Plugin = () => {
	const bounds = useRef<any>()
	makePluginResizeable()
	const {
		preview,
		previewBounds,
		light,
		setLight,
		setTarget,
		setBackground,
		setSelection
	} = useStore((state) => ({
		preview: state.preview,
		previewBounds: state.previewBounds,
		light: state.light,
		setLight: state.setLight,
		setTarget: state.setTarget,
		setBackground: state.setBackground,
		setSelection: state.setSelection
	}))

	/**
	 * ✉️ Emit preview update TO plugin (main.ts)
	 */
	useEffect(() => {
		debounceCanvasUpdate(preview)
	}, [preview])
	const debounceCanvasUpdate = useCallback(
		debounce(
			(data) => emit('UPDATE_SHADOWS', data),
			DEBOUNCE_CANVAS_UPDATES
		),
		[]
	)

	/**
	 * 👂 Listen for changes FROM plugin (main.ts)
	 *
	 * · See if the selected element has shadows from an earlier sessions and if yes, update the preview with said values
	 * · Listen for selection updates and style the target element respectively
	 * · See if a background color can be derived from the canvas (by checking nodes that intersect with selection)
	 */
	useEffect(() => {
		on('DERIVED_BACKGROUND_COLOR_FROM_CANVAS', updateDerivedBackgroundColor)
		on('SELECTION_CHANGE', updateSelection)
		on('LOAD_EXISTING_SHADOW_DATA', restorePreviousShadow)
	}, [])

	const restorePreviousShadow = useCallback((preview: Preview) => {
		const { azimuth, distance, brightness, elevation } = preview
		const { dx, dy } = deriveXYFromAngle(azimuth, distance)
		// at this point, previewBounds hasnt been updated so we use the initial window values because we can safely assume that the window hasn't been resized
		const adjustedX = WINDOW_INITIAL_WIDTH / 2 - light.size / 2 - dx
		const adjustedY = WINDOW_INITIAL_HEIGHT / 2 - light.size / 2 - dy
		const lightData: Pick<Light, 'x' | 'y' | 'brightness'> = {
			x: adjustedX,
			y: adjustedY,
			brightness
		}
		setLight(lightData)
		const targetData: Pick<Target, 'elevation'> = { elevation }
		setTarget(targetData)
	}, [])

	const updateSelection = useCallback((selection: Selection) => {
		setSelection(selection)
	}, [])

	const updateDerivedBackgroundColor = useCallback(
		(backgroundColor: SolidPaint | undefined) => {
			let color
			if (backgroundColor) {
				const { opacity } = backgroundColor
				const { r, g, b } = backgroundColor.color
				color = chroma.gl(r, g, b, opacity).hex()
			} else {
				color = BACKGROUND_DEFAULT_COLOR
			}
			const data: Partial<Background> = { auto: color }
			setBackground(data)
		},
		[setBackground]
	)

	return (
		<PreviewEditor ref={bounds}>
			<Menu bounds={bounds} />
		</PreviewEditor>
	)
}

const makePluginResizeable = () => {
	const onWindowResize = (windowSize: { width: number; height: number }) => {
		emit('RESIZE_WINDOW', windowSize)
	}
	useWindowResize(onWindowResize, {
		minWidth: WINDOW_MIN_WIDTH,
		minHeight: WINDOW_MIN_HEIGHT,
		maxWidth: WINDOW_MAX_WIDTH,
		maxHeight: WINDOW_MAX_HEIGHT
	})
	return null
}

export default render(Plugin)

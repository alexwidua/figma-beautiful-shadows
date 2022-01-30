import { h } from 'preact'
import useStore from './store/useStore'
import { useRef, useEffect, useCallback } from 'preact/hooks'
import { emit, on } from '@create-figma-plugin/utilities'
import { useWindowResize, render } from '@create-figma-plugin/ui'
import { debounce } from './utils/debounce'
import chroma from 'chroma-js'
import Preview from './ui/Preview/preview'
import Menu from './ui/Menu/menu'
import {
	DEBOUNCE_CANVAS_UPDATES,
	WINDOW_MIN_WIDTH,
	WINDOW_MAX_WIDTH,
	WINDOW_MIN_HEIGHT,
	WINDOW_MAX_HEIGHT,
	BACKGROUND_DEFAULT_COLOR
} from './constants'

// Types
import { Selection } from './store/createSelection'
import { Background } from './store/createBackground'

const Plugin = () => {
	const bounds = useRef<any>()
	makePluginResizeable()
	const { preview, setBackground, setSelection } = useStore((state: any) => ({
		preview: state.preview,
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
	 * · Listen for selection updates and style the target element respectively
	 * · See if a background color can be derived from the canvas (by checking nodes that intersect with selection)
	 */
	useEffect(() => {
		on('DERIVED_BACKGROUND_COLOR_FROM_CANVAS', updateDerivedBackgroundColor)
		on('SELECTION_CHANGE', updateSelection)
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
		<Preview ref={bounds}>
			<Menu bounds={bounds} />
		</Preview>
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

import { h } from 'preact'
import useStore from './store/useStore'
import { useRef, useEffect, useCallback } from 'preact/hooks'
import { emit, on } from '@create-figma-plugin/utilities'
import { useWindowResize, render } from '@create-figma-plugin/ui'
import { clamp } from './utils/math'
import chroma from 'chroma-js'
import PreviewEditor from './ui/Preview/preview'
import Menu from './ui/Menu/menu'

// Constants
import {
	WINDOW_INITIAL_WIDTH,
	WINDOW_INITIAL_HEIGHT,
	WINDOW_MIN_WIDTH,
	WINDOW_MAX_WIDTH,
	WINDOW_MIN_HEIGHT,
	WINDOW_MAX_HEIGHT,
	LIGHT_INITIAL_POSITION,
	SHADOW_DEFAULT_COLOR,
	BACKGROUND_DEFAULT_COLOR
} from './constants'

// Types
import { Light } from './store/createLight'
import { Target } from './store/createTarget'
import { Selection } from './store/createSelection'
import { PluginData } from './main'

const Plugin = () => {
	const bounds = useRef<any>()
	makePluginResizeable()
	const {
		light,
		target,
		setColor,
		setPreview,
		setSelection,
		setEntireStore
	} = useStore((state) => ({
		light: state.light,
		target: state.target,
		setColor: state.setColor,
		setPreview: state.setPreview,
		setSelection: state.setSelection,
		setEntireStore: state.setEntireStore
	}))

	/**
	 * 👂 Listen for changes FROM plugin (main.ts)
	 *
	 * · See if the selected element has shadows from an earlier sessions and if yes, update the preview with said values
	 * · Listen for selection updates and style the target element respectively
	 */
	useEffect(() => {
		on('SELECTION_CHANGE', handleSelectionChange)
		on('LOAD_EXISTING_SHADOW_DATA', restorePrevEffectsAndSettings)
	}, [])

	const restorePrevEffectsAndSettings = useCallback(
		(pluginData: PluginData) => {
			const {
				lightPosition,
				shadowColor,
				brightness,
				elevation,
				previewBounds
			} = pluginData
			const x = lightPosition?.x || LIGHT_INITIAL_POSITION.x
			const y = lightPosition?.y || LIGHT_INITIAL_POSITION.y
			const lightData: Pick<Light, 'x' | 'y' | 'brightness'> = {
				x,
				y,
				brightness
			}
			const targetData: Pick<Target, 'elevation'> = { elevation }
			setEntireStore({
				color: shadowColor || '#000',
				light: { ...light, ...lightData },
				target: { ...target, ...targetData }
			})
			const restoreWindowSize = previewBounds || {
				width: WINDOW_INITIAL_WIDTH,
				height: WINDOW_INITIAL_HEIGHT
			}
			emit('RESIZE_WINDOW', restoreWindowSize)

			// Shadows created in version =<9 don't have the lightPosition property
			if (lightPosition !== undefined) {
				emit('SHOW_MESSAGE', 'Restored previous shadow settings.')
			} else {
				emit(
					'SHOW_MESSAGE',
					`Couldn't restore all previous shadow settings due to a newer version. Sorry!`
				)
			}
		},
		[]
	)

	const handleSelectionChange = useCallback((selection: Selection) => {
		setSelection(selection)

		const { derivedBackgroundColor } = selection
		setShadowColorAndBackground(derivedBackgroundColor)

		const { prevShadowEffects } = selection
		if (prevShadowEffects) {
			restorePrevEffectsAndSettings(prevShadowEffects)
		}
	}, [])

	const setShadowColorAndBackground = useCallback(
		(derivedBackgroundColor: RGBA | undefined) => {
			let shadowColor = SHADOW_DEFAULT_COLOR
			let backgroundColor = BACKGROUND_DEFAULT_COLOR
			if (derivedBackgroundColor) {
				const { r, g, b, a } = derivedBackgroundColor
				const toHex = chroma.gl(r, g, b, a).hex()
				// tint shadow based on bg color
				let hsl: any = chroma(toHex).hsl()
				// check if color has hue (ex. no white, grey, black)
				if (isNaN(hsl[0])) {
					hsl = [0, 0, 0]
				} else {
					hsl[2] = clamp(hsl[2] - 0.8, 0.1, 1) // decrease lightness
				}
				const color = chroma.hsl(hsl[0], hsl[1], hsl[2]).hex()
				shadowColor = color.replace('#', '')
				backgroundColor = toHex
			}
			setColor(shadowColor)
			setPreview({
				backgroundColor
			})
		},
		[]
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

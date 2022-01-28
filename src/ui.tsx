import { h } from 'preact'
import { useRef, useState, useEffect, useCallback } from 'preact/hooks'
import { emit, on } from '@create-figma-plugin/utilities'
import Preview from './ui/Preview/preview'
import OptionsPanel from './ui/OptionsPanel/panel'
import chroma from 'chroma-js'
import {
	Button,
	Columns,
	useWindowResize,
	IconButton,
	IconAdjust32,
	render
} from '@create-figma-plugin/ui'
import styles from './ui.css'

import {
	WINDOW_MIN_WIDTH,
	WINDOW_MAX_WIDTH,
	WINDOW_MIN_HEIGHT,
	WINDOW_MAX_HEIGHT,
	SCENE_DEFAULT_BG_COLOR
} from './constants'

/**
 * Types
 */
import { Scene } from './ui/Preview/preview'
import { SelectionParameters } from './main'
export type BackgroundOption = 'DISABLE' | 'DETECT' | 'CUSTOM'

const Plugin = () => {
	/**
	 * UI states
	 */
	const [optionsPanelOpen, setOptionsPanelOpen] = useState<boolean>(false)
	const [BGOption, setBGOption] = useState<BackgroundOption>('DETECT')
	const [detectedBGColor, setDetectedBGColor] = useState<string>(
		SCENE_DEFAULT_BG_COLOR
	)
	const [customBGColor, setCustomBGColor] = useState<string>(
		SCENE_DEFAULT_BG_COLOR
	)
	const [canvasSelection, setCanvasSelection] = useState<SelectionParameters>(
		{
			state: 'EMPTY',
			type: 'RECTANGLE',
			width: 0,
			height: 0,
			cornerRadius: 0
		}
	)

	/**
	 * Menu
	 */
	const menuRef = useRef<any>()
	const [menuRect, setMenuRect] = useState<Partial<DOMRect>>({
		x: 0,
		y: 0,
		width: 0,
		height: 0
	})

	useEffect(() => {
		if (!menuRef.current) return
		const rect = menuRef.current.getBoundingClientRect()
		const { x, y, width, height } = rect
		setMenuRect({ x, y, width, height })
	}, [menuRef])

	/**
	 * Emit changes to plugin
	 */

	// Apply changes and close ui
	const handleApplyButtonClick = useCallback(() => {
		emit('APPLY')
	}, [])

	// Update scene and re-draw shadows on canvas element
	const handleSceneChange = useCallback((data: Scene) => {
		emit('SCENE_UPDATE', data)
	}, [])

	// Handle detected background color from canvas element
	const handleDeriveBGColorFromCanvas = (data: SolidPaint) => {
		let color
		if (data) {
			const { opacity } = data
			const { r, g, b } = data.color
			color = chroma.gl(r, g, b, opacity).hex()
		} else {
			color = SCENE_DEFAULT_BG_COLOR
		}
		setDetectedBGColor(color)
	}

	// Handle selection changes and updates visual states (ex. selection outlines)
	const handleSelectionChange = (selection: SelectionParameters) => {
		setCanvasSelection(selection)
	}

	useEffect(() => {
		on('DERIVE_BACKGROUND_COLOR', handleDeriveBGColorFromCanvas)
		on('SELECTION_CHANGE', handleSelectionChange)
	}, [])

	/**
	 * Add resizeable plugin window
	 */
	const windowRef = useRef<any>()
	const onWindowResize = (windowSize: { width: number; height: number }) => {
		emit('RESIZE_WINDOW', windowSize)
	}
	useWindowResize(onWindowResize, {
		minWidth: WINDOW_MIN_WIDTH,
		minHeight: WINDOW_MIN_HEIGHT,
		maxWidth: WINDOW_MAX_WIDTH,
		maxHeight: WINDOW_MAX_HEIGHT
	})

	return (
		<div ref={windowRef} style={{ background: '#e5e5e5' }}>
			<Preview
				canvasSelection={canvasSelection}
				backgroundColor={
					BGOption === 'DISABLE'
						? SCENE_DEFAULT_BG_COLOR
						: BGOption === 'DETECT'
						? detectedBGColor
						: customBGColor
				}
				onSceneChange={handleSceneChange}>
				<div className={styles.menu} ref={menuRef}>
					<Columns space="extraSmall">
						<IconButton
							onChange={() =>
								setOptionsPanelOpen((prev) => !prev)
							}
							value={optionsPanelOpen}>
							<IconAdjust32 />
						</IconButton>
						<Button
							style={{ minWidth: 96 }}
							onClick={handleApplyButtonClick}>
							Apply
						</Button>
					</Columns>
					<OptionsPanel
						anchor={menuRect}
						panelOpen={optionsPanelOpen}
						BGOption={BGOption}
						panelDragBounds={windowRef}
						onPanelClose={() => setOptionsPanelOpen(false)}
						onBGColorChange={(color: any) =>
							setCustomBGColor(color)
						}
						onBGOptionChange={(option: any) => setBGOption(option)}
					/>
				</div>
			</Preview>
		</div>
	)
}

export default render(Plugin)

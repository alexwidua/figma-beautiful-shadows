import { h } from 'preact'
import {
	Button,
	Container,
	Columns,
	VerticalSpace,
	useWindowResize,
	IconButton,
	IconAdjust32,
	render
} from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import OptionsPanel from './ui/OptionsPanel/panel'
import Preview from './ui/Preview/preview'
import { useRef, useState } from 'preact/hooks'
import styles from './ui.css'

/**
 * Types
 */

export type BackgroundOption = 'DETECT' | 'CUSTOM'

const Plugin = () => {
	/**
	 * Add resizeable plugin window
	 */
	const windowRef = useRef<any>()
	const onWindowResize = (windowSize: { width: number; height: number }) => {
		emit('RESIZE_WINDOW', windowSize)
	}
	useWindowResize(onWindowResize, {
		minWidth: 340,
		minHeight: 360,
		maxWidth: 640,
		maxHeight: 640
	})

	/**
	 * Plugin options
	 */
	const [optionsPanelOpen, setOptionsPanelOpen] = useState(false)

	// Background color
	const [BGOption, setBGOption] = useState<BackgroundOption>('DETECT')
	const [detectedBGColor, setDetectedBGColor] = useState<string>('#e5e5e5')
	const [customBGColor, setCustomBGColor] = useState<string>('#e5e5e5')

	return (
		<div ref={windowRef} style={{ background: '#e5e5e5' }}>
			<OptionsPanel
				panelOpen={optionsPanelOpen}
				onPanelClose={() => setOptionsPanelOpen(false)}
				BGOption={BGOption}
				onBGColorChange={(color: any) => setCustomBGColor(color)}
				onBGOptionChange={(option: any) => setBGOption(option)}
				panelDragBounds={windowRef}
			/>
			<Preview
				backgroundColor={
					BGOption === 'DETECT' ? detectedBGColor : customBGColor
				}>
				<div className={styles.menu}>
					<Columns space="small">
						<IconButton
							onChange={() => setOptionsPanelOpen(true)}
							value={optionsPanelOpen}>
							<IconAdjust32 />
						</IconButton>

						<Button
							style={{ minWidth: 96 }}
							onClick={() => setOptionsPanelOpen(true)}>
							Apply
						</Button>
					</Columns>
				</div>
			</Preview>
		</div>
	)
}

export default render(Plugin)

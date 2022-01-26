import { h } from 'preact'
import { useState, useEffect, useRef } from 'preact/hooks'
import useWindowBounds, { WindowBounds } from '../../hooks/useWindowBounds'
import { useDrag } from '@use-gesture/react'
import { useSpring, animated } from '@react-spring/web'
import chroma from 'chroma-js'
import {
	Container,
	Text,
	IconButton,
	VerticalSpace,
	SegmentedControl,
	Textbox,
	IconCross32
} from '@create-figma-plugin/ui'
import styles from './panel.css'

/**
 * Types
 */
interface PanelProps {
	panelOpen: boolean
	onPanelClose: Function
	BGOption: any
	onBGColorChange: Function
	onBGOptionChange: Function
	panelDragBounds: any
}
const Panel = ({
	panelOpen,
	onPanelClose,
	BGOption,
	onBGColorChange,
	onBGOptionChange,
	panelDragBounds
}: PanelProps) => {
	const { vw, vh }: WindowBounds = useWindowBounds()
	const panelRef = useRef<any>()

	/**
	 * Handle panel drag logic.
	 */
	const [{ x, y }, animate] = useSpring(() => ({ x: 0, y: 0 }))
	const drag: any = useDrag(
		({ offset: [ox, oy] }) => {
			animate.set({ x: ox, y: oy })
		},
		{
			bounds: panelDragBounds,
			from: () => [x.get(), y.get()]
		}
	)
	useEffect(() => {
		// keep panel in bounds
		if (!vw || !vh || !panelRef.current) return
		const rect = panelRef.current.getBoundingClientRect()
		if (x.get() + rect.width > vw) {
			animate.start({ x: vw - rect.width })
		}
		if (y.get() + rect.height > vh) {
			animate.start({ y: vh - rect.height })
		}
	}, [vw, vh])

	const handlePanelClose = () => {
		animate.start({ x: 0, y: 0 })
		onPanelClose()
	}

	/**
	 * Handle backdrop color input
	 */
	const [tempBackgroundColor, setTempBackgroundColor] = useState('#000')
	const handleBackgroundColorInput = (e: any) => {
		const color = e.currentTarget.value
		setTempBackgroundColor(color)
	}
	const validateColorOnBlur = (color: string) => {
		const valid = chroma.valid(color)
		if (valid) onBGColorChange(tempBackgroundColor)
		return valid
	}
	const backgroundOptions: any = [
		{ value: 'DETECT', children: 'Detect' },
		{
			value: 'CUSTOM',
			children: (
				<Textbox
					onClick={() => onBGOptionChange('CUSTOM')}
					onInput={handleBackgroundColorInput}
					value={tempBackgroundColor}
					validateOnBlur={validateColorOnBlur}
					style={{
						height: 24,
						opacity: BGOption === 'CUSTOM' ? 1 : 0.4
					}}
				/>
			)
		}
	]

	return (
		<animated.div
			className={`
			${styles.panel} 
			${panelOpen ? styles.open : undefined}
			`}
			style={{ x, y }}
			ref={panelRef}
			{...drag()}>
			<div class={styles.top}>
				<Text bold>Backdrop</Text>
				<IconButton onChange={handlePanelClose} value={false}>
					<IconCross32 />
				</IconButton>
			</div>
			<VerticalSpace space={'small'} />
			<Container space={'small'}>
				<SegmentedControl
					onChange={(e) => onBGOptionChange(e.currentTarget.value)}
					options={backgroundOptions}
					value={BGOption}
				/>
				<VerticalSpace space={'small'} />
				<Text muted>TODO: Copy here</Text>
				<VerticalSpace space={'small'} />
			</Container>
		</animated.div>
	)
}

export default Panel

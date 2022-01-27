import { h } from 'preact'
import { useState, useEffect, useRef } from 'preact/hooks'
import useWindowSize, { WindowSize } from '../../hooks/useWindowSize'
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
	anchor: Partial<DOMRect>
	panelOpen: boolean
	onPanelClose: Function
	BGOption: any
	onBGColorChange: Function
	onBGOptionChange: Function
	panelDragBounds: any
}
const Panel = ({
	anchor,
	panelOpen,
	onPanelClose,
	BGOption,
	onBGColorChange,
	onBGOptionChange,
	panelDragBounds
}: PanelProps) => {
	const { vw, vh }: WindowSize = useWindowSize()
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
		const padding = 32
		if (x.get() < 0 - vw + rect.width) {
			animate.start({ x: 0 - vw + rect.width + padding })
		}
		if (y.get() < 0 - vh + rect.height) {
			animate.start({ y: 0 - vh + rect.height + padding })
		}
	}, [vw, vh])

	const handlePanelClose = () => {
		onPanelClose()
	}

	// Spawn panel anchored to another element
	useEffect(() => {
		if (!panelRef.current) return
		const rect = panelRef.current.getBoundingClientRect()
		const padding = 8
		animate.set({ x: 0, y: 0 - rect.height - padding })
	}, [anchor, panelOpen])

	/**
	 * Handle backdrop color input
	 */
	const [tempBackgroundColor, setTempBackgroundColor] = useState('#e5e5e5')
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
		{ value: 'DISABLE', children: '-' },
		{ value: 'DETECT', children: 'Automatic' },
		{
			value: 'CUSTOM',
			children: (
				<Textbox
					onClick={() => onBGOptionChange('CUSTOM')}
					onInput={handleBackgroundColorInput}
					value={
						BGOption === 'CUSTOM'
							? tempBackgroundColor
							: 'Choose...'
					}
					validateOnBlur={validateColorOnBlur}
					style={{
						height: 24,
						width: 64,
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
				<Text bold>Options</Text>
				<IconButton onChange={handlePanelClose} value={false}>
					<IconCross32 />
				</IconButton>
			</div>
			<VerticalSpace space={'small'} />
			<Container space={'small'}>
				<div className={styles.row}>
					<Text className={styles.label}>Background</Text>
					<SegmentedControl
						onChange={(e) =>
							onBGOptionChange(e.currentTarget.value)
						}
						options={backgroundOptions}
						value={BGOption}
					/>
				</div>
				<VerticalSpace space={'small'} />
				<Text muted>
					The background color is used to tint the shadow for a more
					realistic result.
				</Text>
				<VerticalSpace space={'small'} />
			</Container>
		</animated.div>
	)
}

export default Panel

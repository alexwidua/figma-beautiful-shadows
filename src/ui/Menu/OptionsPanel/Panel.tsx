import { h } from 'preact'
import useStore from '../../../store/useStore'
import { useState, useEffect, useRef } from 'preact/hooks'
import { useDrag } from '@use-gesture/react'
import { useSpring, animated } from '@react-spring/web'
import {
	Text,
	IconButton,
	VerticalSpace,
	IconCross32
} from '@create-figma-plugin/ui'
import styles from './panel.css'

const Panel = ({ bounds, anchor, open, onClose, children }: any) => {
	const { previewBounds } = useStore((state: any) => ({
		previewBounds: state.previewBounds
	}))

	const panelRef = useRef<any>()
	const [panelRect, setPanelRect] = useState({
		x: 0,
		y: 0,
		width: 0,
		height: 0
	})

	useEffect(() => {
		if (!panelRef.current) return
		const rect = panelRef.current.getBoundingClientRect()
		setPanelRect({
			x: rect.x,
			y: rect.y,
			width: rect.width,
			height: rect.height
		})
	}, [panelRef, previewBounds])

	/**
	 * ✋ Handle drag gesture and translation
	 */
	const [{ x, y }, animate] = useSpring(() => ({ x: 0, y: 0 }))
	const drag: any = useDrag(
		({ offset: [ox, oy] }) => {
			animate.set({ x: ox, y: oy })
		},
		{
			bounds,
			from: () => [x.get(), y.get()]
		}
	)

	// Spawn panel anchored to another element
	useEffect(() => {
		const padding = 8
		animate.set({ x: 0, y: 0 - panelRect.height - padding })
	}, [anchor, open])

	useEffect(() => {
		if (!previewBounds.width || !previewBounds.height) return
		const tresholdX = 0 - previewBounds.width + panelRect.width
		const tresholdY = 0 - previewBounds.height + panelRect.height
		const OOBx = x.get() < 0 - previewBounds.width + panelRect.width
		const OOBy = y.get() < 0 - previewBounds.height + panelRect.height
		const padding = 32
		if (OOBx && OOBy)
			animate.start({ x: tresholdX + padding, y: tresholdY + padding })
		else if (OOBx) animate.start({ x: tresholdX + padding })
		else if (OOBy) animate.start({ y: tresholdY + padding })
	}, [previewBounds.width, previewBounds.height])

	return (
		<animated.div
			class={`
			${styles.panel} 
			${open ? styles.open : undefined}
			`}
			style={{ x, y }}
			ref={panelRef}
			{...drag()}>
			<div class={styles.navbar}>
				<Text bold>Options</Text>
				<IconButton onChange={onClose} value={false}>
					<IconCross32 />
				</IconButton>
			</div>
			<VerticalSpace space={'small'} />
			{children}
		</animated.div>
	)
}

export default Panel

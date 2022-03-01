/**
 * @file This file is taken from the '@alexwidua/create-figma-plugin-components' and
 * makes some minor changes to the title bar prop
 *
 * TODO: Update '@alexwidua/create-figma-plugin-components' to avoid redundancy
 */
import { h, ComponentChildren, RefObject } from 'preact'
import { useState, useEffect, useRef } from 'preact/hooks'
import { useDrag } from '@use-gesture/react'
import { useSpring, animated } from '@react-spring/web'
import {
	createClassName,
	IconButton,
	IconCross32
} from '@create-figma-plugin/ui'
import { CSSProperties } from 'react'
import styles from './panel.css'

export interface PanelProps {
	open: boolean
	title?: ComponentChildren
	children: ComponentChildren
	boundsRef: RefObject<HTMLDivElement>
	anchorRef: RefObject<HTMLDivElement>
	anchorMargin?: number
	anchorAlign?: 'LEFT' | 'RIGHT'
	onClose: () => void
	style?: CSSProperties
}

export function Panel({
	open,
	title = 'Options',
	boundsRef,
	anchorRef,
	anchorMargin = 8,
	anchorAlign = 'LEFT',
	onClose,
	children,
	...rest
}: PanelProps) {
	const panelRef = useRef<HTMLDivElement>(null)

	/**
	 * Spawn panel above anchorRef element
	 */
	useEffect(() => {
		if (!anchorRef?.current || !panelRef?.current) return
		const anchorRect = anchorRef.current.getBoundingClientRect()
		const panelRect = panelRef.current.getBoundingClientRect()

		const alignXToAnchorLeft =
			anchorRect.x + panelRect.width - window.innerWidth
		const alignXToAnchorRight =
			anchorRect.x + anchorRect.width - window.innerWidth
		const y = anchorRect.y - window.innerHeight - anchorMargin

		animate.set({
			x:
				anchorAlign === 'LEFT'
					? alignXToAnchorLeft
					: alignXToAnchorRight,
			y
		})
	}, [panelRef, open])

	const [{ x, y }, animate] = useSpring(() => ({ x: 0, y: 0 }))
	const drag = useDrag(
		({ offset: [ox, oy] }) => {
			animate.set({ x: ox, y: oy })
		},
		{
			bounds: boundsRef,
			from: () => [x.get(), y.get()]
		}
	)

	/**
	 * Keep panel in bounds when plugin window is resizeable
	 */
	const [boundsRect, setBoundsRect] = useState({ width: 0, height: 0 })
	useEffect(() => {
		const handleResize = () => {
			if (!boundsRef?.current) return
			const rect = boundsRef.current.getBoundingClientRect()
			setBoundsRect({ width: rect.width, height: rect.height })
		}
		window.addEventListener('resize', handleResize)
		return () => {
			window.removeEventListener('resize', handleResize)
		}
	}, [])
	useEffect(() => {
		if (!panelRef.current || !boundsRect.width || !boundsRect.height) return

		const panelRect = panelRef.current.getBoundingClientRect()
		const outOfBoundsX =
			Math.abs(x.get() - panelRect.width) > window.innerWidth
		const outOfBoundsY =
			Math.abs(y.get() - panelRect.height) > window.innerHeight

		animate.set({
			x: outOfBoundsX ? 0 - window.innerWidth + panelRect.width : x.get(),
			y: outOfBoundsY
				? 0 - window.innerHeight + panelRect.height
				: y.get()
		})
	}, [boundsRect])

	return (
		<animated.div
			className={createClassName([
				styles.panel,
				open ? styles.open : null
			])}
			style={{ x, y }}
			ref={panelRef}
			{...drag()}
			{...rest}>
			<div className={styles.titlebar}>
				{title}
				<IconButton onChange={onClose} value={false}>
					<IconCross32 />
				</IconButton>
			</div>
			{children}
		</animated.div>
	)
}

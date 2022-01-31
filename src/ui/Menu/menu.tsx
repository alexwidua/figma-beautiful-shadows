import { h } from 'preact'
import useStore from '../../store/useStore'
import { useRef, useState, useEffect, useCallback } from 'preact/hooks'
import { emit } from '@create-figma-plugin/utilities'
import {
	Button,
	Columns,
	IconButton,
	IconAdjust32
} from '@create-figma-plugin/ui'
import OptionsPanel from './OptionsPanel'
import styles from './menu.css'

const Menu = ({ bounds }: any) => {
	const selection = useStore((state) => state.selection)

	const menuRef = useRef<any>()
	const [optionsPanelOpen, setOptionsPanelOpen] = useState<boolean>(false)
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

	const applyShadowsToSelectedCanvasElement = useCallback(() => {
		emit('APPLY')
	}, [])

	return (
		<div className={styles.menu} ref={menuRef}>
			<Columns space="extraSmall">
				<IconButton
					onChange={() => setOptionsPanelOpen((prev) => !prev)}
					value={optionsPanelOpen}>
					<IconAdjust32 />
				</IconButton>
				<Button
					style={{ minWidth: 96 }}
					disabled={selection.valid !== 'VALID'}
					onClick={applyShadowsToSelectedCanvasElement}
					//@ts-ignore next-line
					style={{ opacity: selection.valid !== 'VALID' ? 0.5 : 1 }}>
					Apply
				</Button>
			</Columns>
			<OptionsPanel
				bounds={bounds}
				anchor={menuRect}
				open={optionsPanelOpen}
				onClose={() => setOptionsPanelOpen(false)}
			/>
		</div>
	)
}

export default Menu

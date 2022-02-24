import { h } from 'preact'
import useStore from '../../store/useStore'
import { useRef, useState, useEffect, useCallback } from 'preact/hooks'
import { emit } from '@create-figma-plugin/utilities'
import {
	Button,
	Columns,
	IconButton,
	IconEllipsis32,
	IconCode32
} from '@create-figma-plugin/ui'
import OptionsPanel from './OptionsPanel'
import styles from './menu.css'

const Menu = ({ bounds }: any) => {
	const selection = useStore((state) => state.selection)

	const [optionsPanelOpen, setOptionsPanelOpen] = useState<boolean>(false)
	const menuRef = useRef<any>()

	const applyShadowsToSelectedCanvasElement = useCallback(() => {
		emit('APPLY')
	}, [])

	return (
		<div className={styles.menu} ref={menuRef}>
			<Columns space={'extraSmall'}>
				<IconButton
					onChange={() => setOptionsPanelOpen((prev) => !prev)}
					value={optionsPanelOpen}>
					<IconEllipsis32 />
				</IconButton>
				<Button
					disabled={selection.state !== 'VALID'}
					onClick={applyShadowsToSelectedCanvasElement}
					//@ts-ignore next-line
					style={{
						minWidth: 96,
						opacity: selection.state !== 'VALID' ? 0.5 : 1
					}}>
					Apply
				</Button>
			</Columns>
			<OptionsPanel
				bounds={bounds}
				anchor={menuRef}
				open={optionsPanelOpen}
				onClose={() => setOptionsPanelOpen(false)}
			/>
		</div>
	)
}

export default Menu

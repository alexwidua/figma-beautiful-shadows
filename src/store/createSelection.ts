import { SetState } from 'zustand'
import { Store } from './useStore'
import { SelectionValidity } from '../utils/selection'

export type Selection = {
	valid: SelectionValidity
	width: number
	height: number
	cornerRadius: number
	type: NodeType
}
export interface SelectionState {
	selection: Selection
	setSelection: (arg: Selection) => void
}

const createSelection = (set: SetState<Store>) => ({
	selection: {
		valid: 'EMPTY' as SelectionValidity,
		width: 0,
		height: 0,
		cornerRadius: 0,
		type: 'RECTANGLE' as NodeType
	},
	setSelection: (selection: Selection) =>
		set(() => ({
			selection: { ...selection }
		}))
})

export default createSelection

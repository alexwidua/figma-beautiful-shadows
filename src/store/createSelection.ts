import { SetState } from 'zustand'
import { Store } from './useStore'
import { SelectionState as _SelectionState } from '../utils/selection'

export type Selection = {
	state: _SelectionState
	width: number
	height: number
	cornerRadius: number
	type: NodeType
	derivedBackgroundColor: RGBA | undefined
	prevShadowEffects: any
}
export interface SelectionState {
	selection: Selection
	setSelection: (arg: Selection) => void
}

const createSelection = (set: SetState<Store>) => ({
	selection: {
		state: 'EMPTY' as _SelectionState,
		width: 0,
		height: 0,
		cornerRadius: 0,
		type: 'RECTANGLE' as NodeType,
		derivedBackgroundColor: undefined,
		prevShadowEffects: undefined
	},
	setSelection: (selection: Selection) =>
		set(() => ({
			selection: { ...selection }
		}))
})

export default createSelection

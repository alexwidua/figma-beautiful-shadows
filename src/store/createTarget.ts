import { SetState } from 'zustand'
import { Store } from './useStore'
import { TARGET_INITIAL_ELEVATION } from '../constants'

export type Target = {
	x: number
	y: number
	elevation: number
	elevationPointerDown: boolean
}
export interface TargetState {
	target: Target
	setTarget: (arg: TargetState | Partial<Target>) => void
}

const createTarget = (set: SetState<Store>) => ({
	target: {
		x: 0,
		y: 0,
		elevation: TARGET_INITIAL_ELEVATION,
		elevationPointerDown: false
	},
	setTarget: (target: TargetState | Partial<Target>) =>
		set((state) => ({ target: { ...state.target, ...target } }))
})

export default createTarget

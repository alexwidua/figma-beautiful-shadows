import { SetState } from 'zustand'
import { Store } from './useStore'
import { BACKGROUND_DEFAULT_COLOR } from '../constants'

export type BackgroundPreference = 'NONE' | 'AUTO' | 'CUSTOM'
export type Background = {
	custom: string
	auto: string
	preference: BackgroundPreference
}

export interface BackgroundState {
	background: Background
	setBackground: (arg: BackgroundState | Partial<Background>) => void
}

const createBackground = (set: SetState<Store>) => ({
	background: {
		custom: BACKGROUND_DEFAULT_COLOR,
		auto: BACKGROUND_DEFAULT_COLOR,
		preference: 'AUTO' as BackgroundPreference
	},
	setBackground: (background: BackgroundState | Partial<Background>) =>
		set((state) => ({
			background: { ...state.background, ...background }
		}))
})

export default createBackground

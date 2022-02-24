import { SetState } from 'zustand'
import { Store } from './useStore'

export interface ShadowColorState {
	color: string
	setColor: (arg: string) => void
}

const createShadowColor = (set: SetState<Store>) => ({
	color: '000000',
	setColor: (color: string) => set({ color })
})

export default createShadowColor

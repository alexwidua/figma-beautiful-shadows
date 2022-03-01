import { SetState } from 'zustand'
import { Store } from './useStore'

export interface ShadowProps {
	color: string
	type: ShadowType
	setColor: (arg: string) => void
	setType: (arg: ShadowType) => void
	toggleType: () => void
}
export type ShadowType = 'DROP_SHADOW' | 'INNER_SHADOW'

const createShadowProps = (set: SetState<Store>) => ({
	color: '000000',
	type: 'DROP_SHADOW' as ShadowType,
	setColor: (color: string) => set({ color }),
	setType: (type: ShadowType) => set({ type }),
	toggleType: () =>
		set((state) => {
			const value: ShadowType =
				state.type === 'DROP_SHADOW' ? 'INNER_SHADOW' : 'DROP_SHADOW'
			return { type: value }
		})
})

export default createShadowProps

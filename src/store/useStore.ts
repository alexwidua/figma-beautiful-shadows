import create from 'zustand'
import createLight, { LightState } from './createLight'
import createPreview, { PreviewState } from './createPreview'
import createPreviewBounds, { PreviewBoundsState } from './createPreviewBounds'
import createSelection, { SelectionState } from './createSelection'
import createShadowColor, { ShadowColorState } from './createShadowColor'
import createTarget, { TargetState } from './createTarget'

export type Store = LightState &
	PreviewState &
	PreviewBoundsState &
	SelectionState &
	ShadowColorState &
	TargetState & { setEntireStore: (arg: any) => void }

const useStore = create<Store>((set) => ({
	...createLight(set),
	...createPreview(set),
	...createPreviewBounds(set),
	...createSelection(set),
	...createShadowColor(set),
	...createTarget(set),
	setEntireStore: (data: Store) =>
		set({
			...createLight,
			...createPreview,
			...createPreviewBounds,
			...createSelection,
			...createShadowColor,
			...createTarget,
			...data
		})
}))

export default useStore

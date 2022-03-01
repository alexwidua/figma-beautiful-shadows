import create from 'zustand'
import createLight, { LightState } from './createLight'
import createPreview, { PreviewState } from './createPreview'
import createPreviewBounds, { PreviewBoundsState } from './createPreviewBounds'
import createSelection, { SelectionState } from './createSelection'
import createShadowProps, { ShadowProps } from './createShadowProps'
import createTarget, { TargetState } from './createTarget'

export type Store = LightState &
	PreviewState &
	PreviewBoundsState &
	SelectionState &
	ShadowProps &
	TargetState & { setEntireStore: (arg: any) => void }

const useStore = create<Store>((set) => ({
	...createLight(set),
	...createPreview(set),
	...createPreviewBounds(set),
	...createSelection(set),
	...createShadowProps(set),
	...createTarget(set),
	setEntireStore: (data: Store) =>
		set({
			...createLight,
			...createPreview,
			...createPreviewBounds,
			...createSelection,
			...createShadowProps,
			...createTarget,
			...data
		})
}))

export default useStore

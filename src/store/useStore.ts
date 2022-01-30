import create from 'zustand'
import createBackground, { BackgroundState } from './createBackground'
import createLight, { LightState } from './createLight'
import createPreview, { PreviewState } from './createPreview'
import createPreviewBounds, { PreviewBoundsState } from './createPreviewBounds'
import createSelection, { SelectionState } from './createSelection'
import createTarget, { TargetState } from './createTarget'

export type Store = BackgroundState &
	LightState &
	PreviewState &
	PreviewBoundsState &
	SelectionState &
	TargetState

const useStore = create<Store>((set) => ({
	...createBackground(set),
	...createLight(set),
	...createPreview(set),
	...createPreviewBounds(set),
	...createSelection(set),
	...createTarget(set)
}))

export default useStore

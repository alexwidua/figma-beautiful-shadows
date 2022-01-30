import { SetState } from 'zustand'
import { Store } from './useStore'
import { PreviewBounds } from '../hooks/usePreviewBounds'

export interface PreviewBoundsState {
	previewBounds: PreviewBounds
}

const createPreviewBounds = (set: SetState<Store>) => ({
	previewBounds: { width: 0, height: 0 },
	setPreviewBounds: (bounds: PreviewBounds) =>
		set(() => ({ previewBounds: bounds }))
})

export default createPreviewBounds

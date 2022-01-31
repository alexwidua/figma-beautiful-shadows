import { SetState } from 'zustand'
import { Store } from './useStore'
import {
	TARGET_INITIAL_ELEVATION,
	LIGHT_INITIAL_BRIGHTNESS,
	BACKGROUND_DEFAULT_COLOR
} from '../constants'

export type Preview = {
	azimuth: number
	distance: number
	elevation: number
	brightness: number
	backgroundColor: string
}
export interface PreviewState {
	preview: Preview
	setPreview: (arg: Preview | Partial<Preview>) => void
}

const createPreview = (set: SetState<Store>) => ({
	preview: {
		azimuth: 0,
		distance: 0,
		elevation: TARGET_INITIAL_ELEVATION,
		brightness: LIGHT_INITIAL_BRIGHTNESS,
		backgroundColor: BACKGROUND_DEFAULT_COLOR
	},
	setPreview: (preview: Preview | Partial<Preview>) =>
		set((state) => ({ preview: { ...state.preview, ...preview } }))
})

export default createPreview

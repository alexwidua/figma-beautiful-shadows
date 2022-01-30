import { SetState } from 'zustand'
import { Store } from './useStore'
import { Alignment } from '../ui/Preview/components/helpers/align'
import {
	LIGHT_SIZE,
	LIGHT_INITIAL_POSITION,
	LIGHT_INITIAL_BRIGHTNESS
} from '../constants'

export type Light = {
	size: number
	x: number
	y: number
	brightness: number
	alignment: Alignment
	positionPointerDown: boolean
	brightnessPointerDown: boolean
}
export interface LightState {
	light: Light
	setLight: (arg: LightState) => void
}

const createLight = (set: SetState<Store>) => ({
	light: {
		size: LIGHT_SIZE,
		x: LIGHT_INITIAL_POSITION.x,
		y: LIGHT_INITIAL_POSITION.y,
		brightness: LIGHT_INITIAL_BRIGHTNESS,
		alignment: 'NONE' as Alignment,
		positionPointerDown: false,
		brightnessPointerDown: false
	},
	setLight: (light: LightState) =>
		set((state) => ({
			light: { ...state.light, ...light }
		}))
})

export default createLight

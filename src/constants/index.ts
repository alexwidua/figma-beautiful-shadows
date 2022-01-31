/**
 * Plugin window
 */

export const WINDOW_INITIAL_WIDTH = 375
export const WINDOW_INITIAL_HEIGHT = 375
export const WINDOW_MIN_WIDTH = 340
export const WINDOW_MIN_HEIGHT = 340
export const WINDOW_MAX_WIDTH = 900
export const WINDOW_MAX_HEIGHT = 900

/**
 * Performance
 */
export const DEBOUNCE_CANVAS_UPDATES = 60 // ms

/**
 * Light source
 */
export const LIGHT_SIZE = 32
export const LIGHT_INITIAL_POSITION = {
	x: WINDOW_INITIAL_WIDTH / 2 - LIGHT_SIZE / 2,
	y: (WINDOW_INITIAL_HEIGHT / 2 - LIGHT_SIZE / 2) / 2
}
export const LIGHT_INITIAL_BRIGHTNESS = 0.6 // value between 0-1
export const LIGHT_MIN_BRIGHTNESS = 0.1 // value between 0-1

/**
 * Target element which casts the shadpw
 */
export const TARGET_INITIAL_ELEVATION = 0.5
export const TARGET_MIN_ELEVATION = 0.025

/**
 * Background
 */
export const BACKGROUND_DEFAULT_COLOR = '#e5e5e5'

/**
 * Shadow
 */
export const SHADOW_BASE_BLUR = 50

/**
 * Preview
 */
export const LIGHT_SNAP_TO_AXIS_TRESHOLD = 6 //px

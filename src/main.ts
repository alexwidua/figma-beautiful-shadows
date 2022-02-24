import { on, once, emit, showUI } from '@create-figma-plugin/utilities'
import { validateSelection, SelectionState } from './utils/selection'
import { getCastedShadows } from './utils/shadow'
import { hexToGL } from './utils/color'
import { searchForEnclosingNode, isSymbol } from './utils/node'
import { WINDOW_INITIAL_WIDTH, WINDOW_INITIAL_HEIGHT } from './constants'

// Types
import { Preview } from './store/createPreview'
import { Selection } from './store/createSelection'
import { PreviewBounds } from './hooks/usePreviewBounds'

const VERSION = 8
const PLUGIN_DATA_KEY = 'beautiful_shadow'
const VALID_NODE_TYPES: Array<NodeType> = [
	'BOOLEAN_OPERATION',
	'COMPONENT',
	'INSTANCE',
	'ELLIPSE',
	'FRAME',
	'GROUP',
	'LINE',
	'POLYGON',
	'RECTANGLE',
	'STAR',
	'TEXT',
	'VECTOR'
]

export interface PluginData extends Preview {
	version?: number
	previewBounds: PreviewBounds
	lightPosition: Vector
}

type ErrorMessage = { [type in SelectionState]: string }
const ERROR_MSG: Pick<ErrorMessage, 'MULTIPLE' | 'INVALID'> = {
	MULTIPLE: 'Select only one element or group elements together.',
	INVALID: 'Element type not supported.'
}

export default function () {
	/**
	 * The preview variable holds all shadow information.
	 * It gets updated everytime the user makes changes in the plugin UI.
	 */
	let pluginData: PluginData | undefined = undefined

	/**
	 * The nodeRef vairable holds a reference to the currently selected node.
	 * We also store the existing node effects to restore them if the node is de-selected.
	 */
	let nodeRef: any | undefined = undefined
	let existingNodeEffects: any = undefined

	/**
	 * When the plugin is closed or cancelled, by default we remove all applied node effects.
	 * The APPLIED_SHADOW_EFFECTS flag skips this step to apply the changes.
	 */
	let APPLIED_SHADOW_EFFECTS: true | undefined

	/**
	 * Check if node has previously set shadow data and load
	 */
	function checkIfExistingShadowData() {
		if (!nodeRef) return
		const pluginData = nodeRef.getPluginData(PLUGIN_DATA_KEY)
		if (pluginData) {
			const data: Preview = JSON.parse(pluginData)
			// emit('LOAD_EXISTING_SHADOW_DATA', data)
			return data
		}
	}

	/**
	 * Handle selection change.
	 * When the user (de)selects an element, we do two things:
	 *
	 * · See if shadow effects are applicable to the selected element
	 * · If there are any overlapping nodes we can use to derive a background color
	 *
	 * We report our findings to the UI by emitting a SELECTION_CHANGE event.
	 */
	function handleSelectionChange(): void {
		const selection = figma.currentPage.selection
		const state: SelectionState = validateSelection(
			selection,
			VALID_NODE_TYPES
		)
		if (state === 'EMPTY') {
			cleanUpAndRestorePrevEffects()
		} else if (state === 'MULTIPLE' || state === 'INVALID') {
			cleanUpAndRestorePrevEffects()
			figma.notify(ERROR_MSG[state])
		} else if (state === 'VALID') {
			if (nodeRef) cleanUpAndRestorePrevEffects()
			nodeRef = selection[0]
			// checkIfExistingShadowData()
			existingNodeEffects = nodeRef.effects
		}
		if (nodeRef?.removed) return

		const data: Selection = {
			state,
			type: nodeRef?.type || undefined,
			width: nodeRef?.width || 0,
			height: nodeRef?.height || 0,
			cornerRadius: !isSymbol(nodeRef?.cornerRadius)
				? nodeRef?.cornerRadius
				: 0,
			derivedBackgroundColor: tryToDeriveBGColorFromCanvas(
				state !== 'VALID'
			),
			prevShadowEffects: checkIfExistingShadowData()
		}

		emit('SELECTION_CHANGE', data)
	}

	/**
	 * Try to 'derive' a background color by searching for a node that encloses the selected node.
	 */
	function tryToDeriveBGColorFromCanvas(skip: boolean): RGBA | undefined {
		if (nodeRef?.removed) return
		if (!nodeRef) return
		if (skip) {
			return undefined
		} else {
			const hasOverlappingNode = searchForEnclosingNode(
				figma.currentPage,
				nodeRef
			)
			if (hasOverlappingNode) {
				const fill =
					hasOverlappingNode.fills[
						hasOverlappingNode.fills.length - 1
					]
				const { color, opacity } = fill
				return { r: color.r, g: color.g, b: color.b, a: opacity }
			}
		}
	}

	/**
	 * Draw shadows ☀️
	 */
	function drawShadows(): void {
		if (nodeRef?.removed) return
		if (!nodeRef || !pluginData) return
		const { azimuth, distance, elevation, brightness, shadowColor } =
			pluginData
		const color = hexToGL(shadowColor)
		const shadows = getCastedShadows({
			numShadows: 6,
			azimuth,
			distance,
			elevation,
			brightness,
			color,
			size: { width: nodeRef.width, height: nodeRef.height }
		})
		const stripExistingShadowEffects = nodeRef.effects.filter(
			(effect: Effect) => effect.type !== 'DROP_SHADOW'
		)
		nodeRef.effects = [...stripExistingShadowEffects, ...shadows]
	}

	function updateSceneAndRedrawShadows(data: any): void {
		pluginData = data
		drawShadows()
	}

	function cleanUpAndRestorePrevEffects(): void {
		if (nodeRef?.removed) return
		if (nodeRef) nodeRef.effects = existingNodeEffects
		nodeRef = undefined
		existingNodeEffects = undefined
	}

	/**
	 * Register Figma event handlers
	 */
	figma.on('selectionchange', handleSelectionChange)
	figma.on('close', function () {
		if (APPLIED_SHADOW_EFFECTS) {
			nodeRef.setPluginData(
				PLUGIN_DATA_KEY,
				JSON.stringify({ ...pluginData, version: VERSION })
			)
			nodeRef.setRelaunchData({
				editShadow: `Edit the shadow effect with Beautiful Shadows`
			})
		} else cleanUpAndRestorePrevEffects()
	})

	/**
	 * Listen and act on updates from the UI side
	 */
	on('SHOW_MESSAGE', (msg: string) => figma.notify(msg))
	on('UPDATE_SHADOWS', updateSceneAndRedrawShadows)
	on(
		'RESIZE_WINDOW',
		function (windowSize: { width: number; height: number }) {
			const { width, height } = windowSize
			figma.ui.resize(width, height)
		}
	)
	once('APPLY', function () {
		APPLIED_SHADOW_EFFECTS = true
		figma.closePlugin()
	})

	once('CLOSE', function () {
		figma.closePlugin()
	})

	showUI({
		width: WINDOW_INITIAL_WIDTH,
		height: WINDOW_INITIAL_HEIGHT
	})
	handleSelectionChange() // emit selection to UI on plugin startup
}

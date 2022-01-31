import { on, once, emit, showUI } from '@create-figma-plugin/utilities'
import { validateSelection, SelectionValidity } from './utils/selection'
import { getCastedShadows } from './utils/shadow'
import { searchForEnclosingNode } from './utils/node'
import { WINDOW_INITIAL_WIDTH, WINDOW_INITIAL_HEIGHT } from './constants'

// Types
import { Preview } from './store/createPreview'
import { Selection } from './store/createSelection'

const PLUGIN_DATA_KEY = 'beautiful_shadow'

export default function () {
	/**
	 * The preview variable holds all shadow information.
	 * It gets updated everytime the user makes changes in the plugin UI.
	 */
	let preview: Preview | undefined = undefined

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

	const validNodeTypes: Array<NodeType> = [
		'BOOLEAN_OPERATION',
		'COMPONENT',
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

	/**
	 * Check if node has previously set shadow data and load
	 */
	function checkIfExistingShadowData() {
		if (!nodeRef) return
		const pluginData = nodeRef.getPluginData(PLUGIN_DATA_KEY)
		if (pluginData) {
			const data: Preview = JSON.parse(pluginData)
			emit('LOAD_EXISTING_SHADOW_DATA', data)
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
		const valid: SelectionValidity = validateSelection(
			selection,
			validNodeTypes
		)
		if (valid === 'EMPTY') {
			cleanUpAndRestorePrevEffects()
		} else if (valid === 'MULTIPLE') {
			figma.notify('Select only one element or group elements together.')
		} else if (valid === 'INVALID') {
			figma.notify('Element type not supported.')
		} else if (valid === 'VALID') {
			if (nodeRef) cleanUpAndRestorePrevEffects()
			nodeRef = selection[0]
			existingNodeEffects = nodeRef.effects
			drawShadows()
		}
		tryToDeriveBGColorFromCanvas(valid !== 'VALID')
		const data: Selection = {
			valid,
			type: nodeRef?.type || undefined,
			width: nodeRef?.width || 0,
			height: nodeRef?.height || 0,
			cornerRadius: nodeRef?.cornerRadius || 0
		}
		emit('SELECTION_CHANGE', data)
	}

	/**
	 * Try to 'derive' a background color by searching for a node that encloses the selected node.
	 */
	function tryToDeriveBGColorFromCanvas(skip: boolean): void {
		let color: SolidPaint | undefined

		if (!skip) {
			const hasOverlappingNode = searchForEnclosingNode(
				figma.currentPage,
				nodeRef
			)
			if (hasOverlappingNode)
				color =
					hasOverlappingNode.fills[
						hasOverlappingNode.fills.length - 1
					]
		}
		emit('DERIVED_BACKGROUND_COLOR_FROM_CANVAS', color)
	}

	/**
	 * Draw shadows ☀️
	 */
	function drawShadows(): void {
		if (!nodeRef || !preview) return

		const { azimuth, distance, elevation, brightness, backgroundColor } =
			preview
		const shadows = getCastedShadows({
			smoothness: 6,
			azimuth,
			distance,
			elevation,
			brightness,
			backgroundColor,
			size: { width: nodeRef.width, height: nodeRef.height }
		})
		const stripExistingShadowEffects = nodeRef.effects.filter(
			(effect: Effect) => effect.type !== 'DROP_SHADOW'
		)
		nodeRef.effects = [...stripExistingShadowEffects, ...shadows]
	}

	function updateSceneAndRedrawShadows(data: Preview): void {
		preview = data
		drawShadows()
	}

	function cleanUpAndRestorePrevEffects(): void {
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
			nodeRef.setPluginData(PLUGIN_DATA_KEY, JSON.stringify(preview))
			nodeRef.setRelaunchData({
				editShadow: `Edit the shadow effect with Beautiful Shadows`
			})
		} else cleanUpAndRestorePrevEffects()
	})

	/**
	 * Listen and act on updates from the UI side
	 */
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
	checkIfExistingShadowData()
}

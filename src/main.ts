import { on, once, emit, showUI } from '@create-figma-plugin/utilities'
import { validateSelection, SelectionState } from './utils/selection'
import { getCastedShadows } from './utils/shadow'
import { searchForIntersectingNode } from './utils/node'

import { WINDOW_INITIAL_WIDTH, WINDOW_INITIAL_HEIGHT } from './constants'
/**
 * Types
 */
import { Scene } from './ui/Preview/preview'
export interface SelectionParameters {
	state: SelectionState
	type: NodeType | undefined
	width: number
	height: number
	cornerRadius: number
}

export default function () {
	/**
	 * Scene settings, receive from the UI. Used to draw all shadows.
	 */
	let scene: Scene | undefined = undefined
	/**
	 * Create a reference to the shadow-receiving node and store
	 * its original effects in case the plugin gets cancelled.
	 */
	let nodeRef: any = undefined
	let existingNodeEffects: any = undefined

	let APPLY_SHADOW: true | undefined

	/**
	 * Valid nodes -> nodes that can receive shadow effects
	 */
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
	 * Handle selection change
	 */
	function handleSelectionChange(): void {
		const selection = figma.currentPage.selection
		const state: SelectionState = validateSelection(
			selection,
			validNodeTypes
		)
		if (state === 'EMPTY') {
			cleanUpAndRestoreEffects()
		} else if (state === 'MULTIPLE') {
			figma.notify('Select only one element or group elements together.')
		} else if (state === 'INVALID') {
			figma.notify('Element type not supported.')
		} else if (state === 'VALID') {
			if (nodeRef) cleanUpAndRestoreEffects()
			nodeRef = selection[0]
			existingNodeEffects = nodeRef.effects

			drawShadows()
		}
		tryToDeriveBGColorFromCanvas()
		const selectionParameters: SelectionParameters = {
			state,
			type: nodeRef?.type || undefined,
			width: nodeRef?.width || 0,
			height: nodeRef?.height || 0,
			cornerRadius: nodeRef?.cornerRadius || 0
		}
		emit('SELECTION_CHANGE', selectionParameters)
	}

	function tryToDeriveBGColorFromCanvas(): void {
		const hasIntersectingNode = searchForIntersectingNode(
			figma.currentPage,
			nodeRef
		)
		let color: SolidPaint | undefined
		if (hasIntersectingNode)
			color =
				hasIntersectingNode.fills[hasIntersectingNode.fills.length - 1]
		else color = undefined
		emit('DERIVE_BACKGROUND_COLOR', color)
	}

	/**
	 * Handle effects
	 */
	function drawShadows(): void {
		if (!nodeRef || !scene) return

		const { azimuth, distance, elevation, brightness, backgroundColor } =
			scene
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

	function updateSceneAndRedrawShadows(data: Scene): void {
		scene = data
		drawShadows()
	}

	function cleanUpAndRestoreEffects(): void {
		if (nodeRef) nodeRef.effects = existingNodeEffects
		nodeRef = undefined
		existingNodeEffects = undefined
	}

	function handlePluginClose() {
		if (!APPLY_SHADOW) cleanUpAndRestoreEffects()
	}

	/**
	 * Handlers
	 */
	figma.on('selectionchange', handleSelectionChange)
	figma.on('close', handlePluginClose)

	once('APPLY', function () {
		APPLY_SHADOW = true
		figma.closePlugin()
	})
	once('CLOSE', function () {
		figma.closePlugin()
	})
	on(
		'RESIZE_WINDOW',
		function (windowSize: { width: number; height: number }) {
			const { width, height } = windowSize
			figma.ui.resize(width, height)
		}
	)
	on('SCENE_UPDATE', updateSceneAndRedrawShadows)

	showUI({
		width: WINDOW_INITIAL_WIDTH,
		height: WINDOW_INITIAL_HEIGHT
	})
	handleSelectionChange()
}

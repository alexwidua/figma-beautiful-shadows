import { on, once, showUI } from '@create-figma-plugin/utilities'

import { CloseHandler } from './types'

export default function () {
	// TODO
	once<CloseHandler>('CLOSE', function () {
		figma.closePlugin()
	})

	on(
		'RESIZE_WINDOW',
		function (windowSize: { width: number; height: number }) {
			const { width, height } = windowSize
			figma.ui.resize(width, height)
		}
	)
	showUI({
		width: 340,
		height: 360
	})
}

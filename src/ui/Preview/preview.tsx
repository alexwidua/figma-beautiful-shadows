import { h } from 'preact'
import { useState, useRef, useEffect } from 'preact/hooks'
import usePreviewBounds, { PreviewBounds } from '../../hooks/usePreviewBounds'
import { vecAngle, vecDistance } from '../../utils/math'
import Target, { TargetValues } from './components/Target/target'
import Light, { LightValues } from './components/Light/light'
import ShowAlignmentLines from './components/ShowAlignmentLines/lines'
import styles from './preview.css'

import {
	TARGET_INITIAL_ELEVATION,
	TARGET_MIN_ELEVATION,
	TARGET_ELEVATION_DRAG_RANGE,
	LIGHT_SOURCE_SIZE,
	LIGHT_INITIAL_BRIGHTNESS
} from '../../constants'

/**
 * Types
 */
import { SelectionParameters } from '../../main'
interface PreviewProps {
	canvasSelection: SelectionParameters
	backgroundColor: string
	children: any
	onSceneChange: Function
}

export interface Scene {
	azimuth: number
	distance: number
	elevation: number
	brightness: number
	backgroundColor: string
}

/**
 * Constants
 */

const Preview = ({
	canvasSelection,
	backgroundColor,
	children,
	onSceneChange
}: PreviewProps) => {
	/**
	 * Get bounds of the preview div.
	 * The bounds are used to define the drag constraints for the light source,
	 * and to calc the position of the shadow receiving target.
	 */
	const previewRef = useRef<any>()
	const { vw, vh }: PreviewBounds = usePreviewBounds(previewRef)

	/**
	 * Scene components
	 */
	const [light, setLight] = useState<LightValues>({
		x: 0,
		y: 0,
		alignment: 'NONE',
		brightness: LIGHT_INITIAL_BRIGHTNESS,
		pointerDown: false
	})
	const [target, setTarget] = useState<TargetValues>({
		x: 0,
		y: 0,
		elevation: TARGET_INITIAL_ELEVATION
	})
	const [scene, setScene] = useState<Scene>({
		azimuth: 0,
		distance: 0,
		elevation: TARGET_INITIAL_ELEVATION,
		brightness: LIGHT_INITIAL_BRIGHTNESS,
		backgroundColor
	})

	/**
	 * Update scene when light or target changed
	 */
	useEffect(() => {
		const _target = {
			x: target.x - LIGHT_SOURCE_SIZE / 2,
			y: target.y - LIGHT_SOURCE_SIZE / 2
		} // assume that target is always centered
		const _light = { x: light.x, y: light.y }

		const azimuth = vecAngle(_target, _light)
		const distance = vecDistance(_light, _target)
		const elevation = target?.elevation || 0
		const brightness = light?.brightness || 0

		const data = {
			azimuth,
			distance,
			elevation,
			brightness,
			backgroundColor
		}
		setScene(data)
		onSceneChange(data)
	}, [light, target, backgroundColor])

	return (
		<div
			className={styles.container}
			style={{ backgroundColor }}
			ref={previewRef}>
			<Target
				preview={{ vw, vh }}
				canvasSelection={canvasSelection}
				scene={scene}
				dragRange={TARGET_ELEVATION_DRAG_RANGE}
				initElevation={TARGET_INITIAL_ELEVATION}
				minElevation={TARGET_MIN_ELEVATION}
				onTargetChange={(target: TargetValues) => setTarget(target)}
			/>
			<Light
				preview={{ vw, vh }}
				size={LIGHT_SOURCE_SIZE}
				bounds={previewRef}
				onPositionChange={(light: LightValues) =>
					setLight((prev) => ({ ...prev, ...light }))
				}
				onBrightnessChange={(brightness: number) =>
					setLight((prev) => ({ ...prev, brightness }))
				}
			/>
			<ShowAlignmentLines
				visible={light.pointerDown}
				preview={{ vw, vh }}
				x={light.x}
				y={light.y}
				alignment={light.alignment}
				offset={LIGHT_SOURCE_SIZE / 2}
			/>
			{children}
		</div>
	)
}

export default Preview

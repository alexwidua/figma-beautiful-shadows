import { h } from 'preact'
import { useState, useRef, useEffect } from 'preact/hooks'
import usePreviewBounds, { PreviewBounds } from '../../hooks/usePreviewBounds'
import { vecAngle, vecDistance } from '../../utils/math'
import Target, { TargetValues } from './components/Target/target'
import Light, { LightValues } from './components/Light/light'
import ShowAlignmentLines from './components/ShowAlignmentLines/lines'
import styles from './preview.css'

/**
 * Types
 */

interface PreviewProps {
	backgroundColor: string
	children: any
}

/**
 * Constants
 */
export const THROTTLE_SCENE_UPDATES = 60 // ms
const LIGHT_SOURCE_SIZE = 24
const ELEVATION_DRAG_RANGE = 50 // Range in px it takes to drag from elevation 0 to 1
const INIT_ELEVATION = 0.5
const MIN_ELEVATION = 0.025

const Preview = ({ backgroundColor, children }: PreviewProps) => {
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
		pointerDown: false
	})
	const [target, setTarget] = useState<TargetValues>({
		x: 0,
		y: 0,
		elevation: INIT_ELEVATION
	})
	const [scene, setScene] = useState({
		azimuth: 0,
		distance: 0,
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

		setScene({ azimuth, distance, backgroundColor })
	}, [light, target, backgroundColor])

	return (
		<div
			className={styles.container}
			style={{ backgroundColor }}
			ref={previewRef}>
			<Target
				preview={{ vw, vh }}
				scene={scene}
				elevation={target.elevation}
				dragRange={ELEVATION_DRAG_RANGE}
				initElevation={INIT_ELEVATION}
				minElevation={MIN_ELEVATION}
				onTargetChange={(target: TargetValues) => setTarget(target)}
			/>
			<Light
				preview={{ vw, vh }}
				size={24}
				bounds={previewRef}
				onLightChange={(light: LightValues) => setLight(light)}
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

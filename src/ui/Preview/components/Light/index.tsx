import { h } from 'preact'
import useStore from '../../../../store/useStore'
import PositionDraggable from './PositionDrag'
import BrightnessSlider from './BrightnessSlider'
import Badge from '../Badge/badge'
import styles from './index.css'

const Light = ({ ...rest }) => {
	const { brightness, brightnessPointerDown } = useStore((state: any) => ({
		brightness: state.light.brightness,
		brightnessPointerDown: state.light.brightnessPointerDown
	}))
	const label = `Brightness ${Math.round(brightness * 100)}%`
	return (
		<PositionDraggable {...rest}>
			<BrightnessSlider>
				<Badge
					style={{
						opacity: brightnessPointerDown ? 1 : 0,
						position: 'absolute',
						top: 0,
						left: '50%',
						transform: 'translate3d(-50%, -32px, 0)'
					}}>
					{label}
				</Badge>
			</BrightnessSlider>
			<div className={styles.light} />
		</PositionDraggable>
	)
}

export default Light

import { h } from 'preact'
import useStore from '../../../../store/useStore'
import PositionDraggable from './PositionDrag'
import BrightnessSlider from './BrightnessSlider'
import Badge from '../Badge/badge'
import styles from './index.css'

const Light = ({ ...rest }) => {
	const { positionY, brightness, brightnessPointerDown } = useStore(
		(state) => ({
			positionY: state.light.y,
			brightness: state.light.brightness,
			brightnessPointerDown: state.light.brightnessPointerDown
		})
	)
	const label = `Brightness ${Math.round(brightness * 100)}%`
	const isHuggingTop = positionY < 32 // used as a trigger to rotate light so brightness slider doesnt slide out of bounds

	return (
		<PositionDraggable
			style={{
				transform: isHuggingTop ? 'rotate(180deg)' : 'rotate(0deg)'
			}}
			{...rest}>
			<BrightnessSlider isHuggingTop={isHuggingTop}>
				<Badge
					style={{
						opacity: brightnessPointerDown ? 1 : 0,
						position: 'absolute',
						top: 0,
						left: '50%',
						transform: `translate3d(-50%, -32px, 0) rotate(${
							isHuggingTop ? 180 : 0
						}deg)`
					}}>
					{label}
				</Badge>
			</BrightnessSlider>
			<div className={styles.light} />
		</PositionDraggable>
	)
}

export default Light

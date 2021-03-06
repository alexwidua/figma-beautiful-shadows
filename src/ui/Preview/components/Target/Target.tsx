import { h, Fragment } from 'preact'
import useElevationSlider from './useElevationSlider'
import useSelectionStyle from './useSelectionStyle'
import useShadowStyle from './useShadowStyle'
import useStore from '../../../../store/useStore'
import { animated, to } from '@react-spring/web'
import Badge from '../Badge/badge'
import styles from './target.css'

// Types
import { Target } from '../../../../store/createTarget'

const Target = ({ ...rest }) => {
	/**
	 * 💾 Store
	 */
	const { elevation, elevationPointerDown, toggleShadowType } = useStore(
		(state) => ({
			elevation: state.target.elevation,
			elevationPointerDown: state.target.elevationPointerDown,
			toggleShadowType: state.toggleType
		})
	)
	const [scale, slide] = useElevationSlider()
	const selectionStyle = useSelectionStyle()
	const shadowStyle = useShadowStyle()
	const label = `Elevation ${Math.round(elevation * 100)}
	%`

	return (
		<Fragment>
			<Badge
				visible={elevationPointerDown}
				style={{
					position: 'absolute',
					left: '50%',
					top: '50%',
					transform: 'translate3d(-50%, 76px, 0)',
					boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.4)'
				}}>
				{label}
			</Badge>
			<animated.div
				className={styles.target}
				style={{
					...selectionStyle,
					...shadowStyle,
					transform: 'translate3d(-50%,-50%,0)',
					scale: to([scale], (s) => s)
				}}
				onDoubleClickCapture={() => toggleShadowType()}
				//@ts-ignore next-line
				{...slide()}
				{...rest}
			/>
		</Fragment>
	)
}

export default Target

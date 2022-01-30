import { Fragment, h } from 'preact'
import useStore from '../../../../store/useStore'
import styles from './lines.css'

const ShowAlignmentLines = () => {
	const {
		previewBounds,
		lightSize,
		lightPosition,
		lightAlignment,
		positionPointerDown
	} = useStore((state: any) => ({
		previewBounds: state.previewBounds,
		lightSize: state.light.size,
		lightPosition: { x: state.light.x, y: state.light.y },
		lightAlignment: state.light.alignment,
		positionPointerDown: state.light.positionPointerDown
	}))
	const offset = lightSize / 2

	const isVisible = positionPointerDown
	const isCentered = lightAlignment === 'CENTER'
	const isHorizontal = lightAlignment === 'HORIZONTAL'
	const isVertical = lightAlignment === 'VERTICAL'
	const isAbove = lightPosition.y < previewBounds.height / 2
	const isLefthand = lightPosition.x < previewBounds.width / 2

	const horizontal = {
		opacity: isVisible && (isCentered || isHorizontal) ? 1 : 0,
		top: isCentered
			? 0
			: isAbove
			? lightPosition.y + offset
			: previewBounds.height / 2,
		height: isCentered
			? '100%'
			: isAbove
			? previewBounds.height / 2 - lightPosition.y - offset
			: lightPosition.y - previewBounds.height / 2 + offset
	}

	const vertical = {
		opacity: isVisible && (isCentered || isVertical) ? 1 : 0,
		left: isCentered
			? 0
			: isLefthand
			? lightPosition.x + offset
			: previewBounds.width / 2,
		width: isCentered
			? '100%'
			: isLefthand
			? previewBounds.width / 2 - lightPosition.x - offset
			: lightPosition.x - previewBounds.width / 2 + offset
	}

	return (
		<Fragment>
			<div
				class={`${styles.line} ${styles.horizontal}`}
				style={horizontal}></div>
			<div
				class={`${styles.line} ${styles.vertical}`}
				style={vertical}></div>
		</Fragment>
	)
}

export default ShowAlignmentLines

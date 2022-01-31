import useStore from '../../../../store/useStore'
import { resizeAndRetainAspectRatio } from '../../../../utils/math'
import { SelectionValidity } from '../../../../utils/selection'

// Constants
const ELEMENT_BASE_WIDTH = 100
const ELEMENT_BASE_HEIGHT = 100

const useSelectionStyle = () => {
	const {
		valid,
		width,
		height,
		cornerRadius
	}: {
		valid: SelectionValidity
		width: number
		height: number
		cornerRadius: number
	} = useStore((state) => ({
		valid: state.selection.valid,
		width: state.selection.width,
		height: state.selection.height,
		cornerRadius: state.selection.cornerRadius
	}))
	const isSelected = valid === 'VALID'
	const {
		width: elementWidth,
		height: elementHeight,
		ratio
	} = resizeAndRetainAspectRatio(
		width,
		height,
		ELEMENT_BASE_WIDTH,
		ELEMENT_BASE_HEIGHT
	)
	const selectionStyles = {
		border: isSelected
			? '1px solid var(--color-blue)'
			: '1px solid rgba(0,0,0,0.2)',
		width: elementWidth || ELEMENT_BASE_WIDTH,
		height: elementHeight || ELEMENT_BASE_HEIGHT,
		borderRadius: cornerRadius * ratio || 4
	}
	return selectionStyles
}

export default useSelectionStyle

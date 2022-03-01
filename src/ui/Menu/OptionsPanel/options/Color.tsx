import { h, JSX } from 'preact'
import useStore from '../../../../store/useStore'
import { TextboxColor } from '@alexwidua/create-figma-plugin-components'

const Color = () => {
	const { color, setColor } = useStore((state) => ({
		color: state.color,
		setColor: state.setColor
	}))

	function handleHexColorInput(event: JSX.TargetedEvent<HTMLInputElement>) {
		const newHexColor = event.currentTarget.value
		setColor(newHexColor)
	}

	return (
		<div>
			<TextboxColor
				hexColor={color}
				onHexColorInput={handleHexColorInput}
				opacityEnabled={false}
				opacity={'100%'}
			/>
		</div>
	)
}

export default Color

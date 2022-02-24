import { h } from 'preact'
import { useState } from 'preact/hooks'
import useStore from '../../../../store/useStore'
import { TextboxColor } from '@alexwidua/create-figma-plugin-components'

const ShadowColor = () => {
	const { color, setColor } = useStore((state) => ({
		color: state.color,
		setColor: state.setColor
	}))

	function handleHexColorInput(event: any) {
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

export default ShadowColor

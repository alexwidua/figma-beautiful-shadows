import { h, Fragment, JSX } from 'preact'
import useStore from '../../../../store/useStore'
import { useState } from 'preact/hooks'
import chroma from 'chroma-js'
import { Text, Textbox, SegmentedControl } from '@create-figma-plugin/ui'
import { BACKGROUND_DEFAULT_COLOR } from '../../../../constants'

//Types
import { BackgroundPreference } from '../../../../store/createBackground'
type BackgroundOption = { value: BackgroundPreference; children: any }

const SetBackgroundColor = () => {
	const { background, setBackground } = useStore((state: any) => ({
		background: state.background,
		setBackground: state.setBackground
	}))
	const [customBackground, setCustomBackground] = useState(
		BACKGROUND_DEFAULT_COLOR
	)
	const handleBackgroundColorInput = (
		e: JSX.TargetedEvent<HTMLInputElement>
	) => {
		const color = e.currentTarget.value
		setCustomBackground(color)
	}
	const validateColorOnBlur = (color: string) => {
		const valid = chroma.valid(color)
		if (valid) setBackground({ custom: customBackground })
		return valid
	}
	const backgroundOptions: BackgroundOption[] = [
		{ value: 'NONE', children: '-' },
		{ value: 'AUTO', children: 'Automatic' },
		{
			value: 'CUSTOM',
			children: (
				<Textbox
					onClick={() => setBackground({ preference: 'CUSTOM' })}
					onInput={handleBackgroundColorInput}
					value={
						background.preference === 'CUSTOM'
							? customBackground
							: 'Choose...'
					}
					validateOnBlur={validateColorOnBlur}
					style={{
						height: 24,
						width: 64,
						opacity: background.preference === 'CUSTOM' ? 1 : 0.4
					}}
				/>
			)
		}
	]

	return (
		<Fragment>
			<Text style={{ marginRight: 16 }}>Background</Text>
			<SegmentedControl
				onChange={(e: JSX.TargetedEvent<HTMLInputElement>) =>
					setBackground({ preference: e.currentTarget.value })
				}
				options={backgroundOptions}
				value={background.preference}
			/>
		</Fragment>
	)
}

export default SetBackgroundColor

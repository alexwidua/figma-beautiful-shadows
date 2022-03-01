import { h, JSX } from 'preact'
import useStore from '../../../../store/useStore'
import { Dropdown } from '@create-figma-plugin/ui'
import { ShadowType } from '../../../../store/createShadowProps'

type DropdownOption = { value: ShadowType; children: string }
const options: DropdownOption[] = [
	{ value: 'DROP_SHADOW', children: 'Drop Shadow' },
	{ value: 'INNER_SHADOW', children: 'Inner Shadow' }
]

const Type = () => {
	const { shadowType, setShadowType } = useStore((state) => ({
		shadowType: state.type,
		setShadowType: state.setType
	}))

	const handleDropdownChange = (e: JSX.TargetedEvent<HTMLInputElement>) => {
		const newValue = e.currentTarget.value as ShadowType
		setShadowType(newValue)
	}

	return (
		<div>
			<Dropdown
				onChange={handleDropdownChange}
				options={options}
				value={shadowType}
				noBorder
			/>
		</div>
	)
}

export default Type

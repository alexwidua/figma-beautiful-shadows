import { h } from 'preact'
import {
	Container,
	Text,
	Divider,
	VerticalSpace
} from '@create-figma-plugin/ui'
import Panel from './Panel'
import Parameters from './options/Parameters'
import BackgroundPreference from './options/BackgroundPreference'
import styles from './index.css'

const Options = ({ bounds, anchor, open, onClose }: any) => {
	return (
		<Panel bounds={bounds} anchor={anchor} open={open} onClose={onClose}>
			<Container space={'small'}>
				<div className={styles.row}>
					<Parameters />
				</div>
				<VerticalSpace space={'small'} />
				<Divider
					style={{
						//@ts-ignore next-line
						marginLeft: 'calc(var(--space-small)*-1)',
						//@ts-ignore next-line
						width: 'calc(100% + (var(--space-small)*2))'
					}}
				/>
				<VerticalSpace space={'small'} />
				<div className={styles.row}>
					<BackgroundPreference />
				</div>
				<VerticalSpace space={'small'} />
				<Text muted>
					The background color is used to tint the shadow for a more
					realistic result.
				</Text>
				<VerticalSpace space={'small'} />
			</Container>
		</Panel>
	)
}

export default Options

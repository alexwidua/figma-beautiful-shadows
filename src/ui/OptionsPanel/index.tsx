import { h } from 'preact'
import { Container, Text, VerticalSpace } from '@create-figma-plugin/ui'
import Panel from './Panel'
import SetBackgroundColor from './options/SetBackgroundColor'
import styles from './index.css'

const Options = ({ bounds, anchor, open, onClose }: any) => {
	return (
		<Panel bounds={bounds} anchor={anchor} open={open} onClose={onClose}>
			<Container space={'small'}>
				<div className={styles.row}>
					<SetBackgroundColor />
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

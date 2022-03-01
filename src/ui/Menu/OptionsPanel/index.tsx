import { h } from 'preact'
import {
	Container,
	Text,
	Divider,
	VerticalSpace
} from '@create-figma-plugin/ui'
// import Panel from './Panel'
import Parameters from './options/Parameters'
import Color from './options/Color'
import Type from './options/Type'
import { Panel } from './Panel'
import styles from './index.css'

const Options = ({ bounds, anchor, open, onClose }: any) => {
	return (
		<Panel
			title={<Type />}
			boundsRef={bounds}
			anchorRef={anchor}
			open={open}
			onClose={onClose}
			anchorAlign="RIGHT"
			anchorMargin={0}>
			<Container space={'small'} style={{ width: 196 }}>
				<VerticalSpace space={'small'} />
				<div className={styles.row}>
					<Parameters />
				</div>
				<VerticalSpace space={'small'} />
				<Color />
				<VerticalSpace space={'small'} />
			</Container>
		</Panel>
	)
}

export default Options

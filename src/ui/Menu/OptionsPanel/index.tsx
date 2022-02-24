import { h } from 'preact'
import {
	Container,
	Text,
	Divider,
	VerticalSpace
} from '@create-figma-plugin/ui'
// import Panel from './Panel'
import Parameters from './options/Parameters'
import ShadowColor from './options/ShadowColor'
import { Panel } from '@alexwidua/create-figma-plugin-components'
import styles from './index.css'

const Options = ({ bounds, anchor, open, onClose }: any) => {
	return (
		<Panel
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
				<Divider
					style={{
						//@ts-ignore next-line
						marginLeft: 'calc(var(--space-small)*-1)',
						//@ts-ignore next-line
						width: 'calc(100% + (var(--space-small)*2))'
					}}
				/>
				<VerticalSpace space={'medium'} />
				<Text bold>Shadow Color</Text>
				<VerticalSpace space={'medium'} />
				<div className={styles.row}>
					<ShadowColor />
				</div>
				<VerticalSpace space={'medium'} />
			</Container>
		</Panel>
	)
}

export default Options

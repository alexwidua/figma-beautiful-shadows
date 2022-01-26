import { h } from 'preact'
import {
	Button,
	Container,
	VerticalSpace,
	useWindowResize,
	render
} from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
// import Panel from './ui/Panel/panel'
import Preview from './ui/Preview/preview'

const Plugin = () => {
	/**
	 * Add resizeable plugin window
	 * Thank you for this easy drop-in solution @YuanQingLim, you're amazing!
	 */
	function onWindowResize(windowSize: { width: number; height: number }) {
		emit('RESIZE_WINDOW', windowSize)
	}
	useWindowResize(onWindowResize, {
		minWidth: 340,
		minHeight: 360,
		maxWidth: 640,
		maxHeight: 640
	})

	return (
		<div>
			<Preview />
			<VerticalSpace space={'small'} />
			<Container>
				<Button fullWidth onClick={() => console.log('lol')}>
					Apply
				</Button>
			</Container>
			<VerticalSpace space={'small'} />
		</div>
	)
}

export default render(Plugin)

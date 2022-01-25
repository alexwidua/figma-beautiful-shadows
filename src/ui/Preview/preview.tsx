import { h, Fragment } from 'preact'
import { useState, useRef, useEffect, useMemo, MutableRef } from 'preact/hooks'
import usePreviewBounds, { PreviewBounds } from '../../hooks/usePreviewBounds'
import { vecAngle, vecDistance } from '../../utils/math'
import { throttle } from '../../utils/throttle'
import chroma from 'chroma-js'
import {
	Button,
	Columns,
	Container,
	render,
	Text,
	Textbox,
	VerticalSpace,
	SegmentedControl
} from '@create-figma-plugin/ui'
import Target from './components/Target/target'
import Light from './components/Light/light'
import ShowAlignmentLines, {
	Alignment
} from './components/ShowAlignmentLines/lines'
import styles from './preview.css'

interface Light {
	x: number
	y: number
	azimuth: number
	distance: number
	targetElevation: number
	alignment: Alignment
	pointerDown: boolean
	tint: string
}

const LIGHT_SOURCE_SIZE = 24
const DEFAULT_TINT = '#000000'

const DRAG_RANGE = 50 // [-DRAG_RANGE..+DRAG_RANGE] Distance to drag to go from min elevation to max elevation
const INIT_ELEVATION = 0.5
const MIN_ELEVATION = 0.025

const Preview = () => {
	const previewRef = useRef<any>()
	const { vw, vh }: PreviewBounds = usePreviewBounds(previewRef)
	const [background, setBackground] = useState(DEFAULT_TINT)

	/**
	 * Where there is light...
	 */
	const [light, setLight] = useState<Light>({
		x: 0,
		y: 0,
		azimuth: 0,
		distance: 0,
		targetElevation: 0.5,
		alignment: 'NONE',
		pointerDown: false,
		tint: DEFAULT_TINT
	})

	const handleLightChange = (
		lightPos: Vector,
		alignment: Alignment = 'NONE',
		pointerDown: boolean = false
	) => {
		const node = {
			// we assume that node is always centered
			x: vw / 2,
			y: vh / 2
		}
		const distance = vecDistance(lightPos, node)
		const azimuth = vecAngle(node, lightPos)

		setLight((prev) => ({
			...prev,
			x: lightPos.x,
			y: lightPos.y,
			azimuth,
			distance,
			alignment,
			pointerDown,
			background
		}))
	}

	const throttledLightChange = useMemo(
		() => throttle(handleLightChange, 50),
		[vw, vh]
	)

	// Update shadows when plugin window is resized
	useEffect(() => {
		handleLightChange({ x: light.x, y: light.y })
	}, [vw, vh])

	// Textbx

	const [input, setInput] = useState('#000')

	function handleInput(event: any) {
		const newValue = event.currentTarget.value
		console.log(newValue)
		setInput(newValue)
	}

	const validateOnBlur = (value: string) => {
		return chroma.valid(value)
	}

	const options: any = [
		{ value: 'A', children: 'Detect' },
		{
			value: 'B',
			children: (
				<Textbox
					onClick={() => setSegmented('B')}
					onInput={handleInput}
					value={input}
					validateOnBlur={validateOnBlur}
					style={{ width: 45, height: 24 }}
				/>
			)
		}
	]

	const [segmented, setSegmented] = useState('A')

	return (
		<Fragment>
			<div class={styles.container} ref={previewRef}>
				<Target
					dragRange={DRAG_RANGE}
					initElevation={INIT_ELEVATION}
					minElevation={MIN_ELEVATION}
					light={light}
					onVerticalDrag={(elevation: number) =>
						setLight((prev) => ({
							...prev,
							targetElevation: elevation
						}))
					}
				/>
				<Light
					size={24}
					bounds={previewRef}
					onLightInputDrag={throttledLightChange}
					preview={{ vw, vh }}
				/>
				<ShowAlignmentLines
					visible={light.pointerDown}
					offset={LIGHT_SOURCE_SIZE / 2}
					x={light.x}
					y={light.y}
					alignment={light.alignment}
					preview={{ vw, vh }}
				/>
				{/* <Container className={styles.menu}>
					<Text>Background</Text>
					<VerticalSpace space={'small'} />
					<SegmentedControl
						onChange={(e) => setSegmented(e.currentTarget.value)}
						options={options}
						value={segmented}
					/>
				</Container> */}
			</div>
		</Fragment>
	)
}

export default Preview

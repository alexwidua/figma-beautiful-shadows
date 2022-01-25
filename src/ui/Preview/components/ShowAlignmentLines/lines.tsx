import { Fragment, h } from 'preact'
import styles from './lines.css'

export type Alignment = 'NONE' | 'CENTER' | 'HORIZONTAL' | 'VERTICAL'

const showAlignmentLines = ({
	visible = false,
	offset = 12,
	x,
	y,
	alignment,
	preview
}: {
	visible: boolean
	offset: number
	x: number
	y: number
	alignment: Alignment
	preview: any
}) => {
	const { vw, vh } = preview

	const isCentered = alignment === 'CENTER'
	const isAlongX = alignment === 'HORIZONTAL'
	const isAlongY = alignment === 'VERTICAL'

	const isLeftHandSide = x < vw / 2
	const isAbove = y < vh / 2

	const lineX = {
		opacity: visible && (isCentered || isAlongX) ? 1 : 0,
		top: isCentered ? 0 : isAbove ? y + offset : vh / 2,
		height: isCentered
			? '100%'
			: isAbove
			? vh / 2 - y - offset
			: y - vh / 2 + offset
	}

	const lineY = {
		opacity: visible && (isCentered || isAlongY) ? 1 : 0,
		left: isCentered ? 0 : isLeftHandSide ? x + offset : vw / 2,
		width: isCentered
			? '100%'
			: isLeftHandSide
			? vw / 2 - x - offset
			: x - vw / 2 + offset
	}

	return (
		<Fragment>
			<div class={`${styles.line} ${styles.x}`} style={lineX}></div>
			<div class={`${styles.line} ${styles.y}`} style={lineY}></div>
		</Fragment>
	)
}

export default showAlignmentLines

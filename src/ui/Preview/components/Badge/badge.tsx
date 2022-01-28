import { h } from 'preact'
import styles from './badge.css'

const Badge = ({
	visible = true,
	children,
	style,
	...rest
}: {
	visible?: boolean
	children: any
	style?: any
}) => {
	return (
		<div
			className={styles.badge}
			style={{ opacity: visible ? 1 : 0, ...style }}
			{...rest}>
			{children}
		</div>
	)
}

export default Badge

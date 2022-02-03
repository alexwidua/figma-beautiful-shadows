import { useEffect, useLayoutEffect, useState } from 'preact/hooks'
import useDebounce from './useDebounce'
import { WINDOW_INITIAL_WIDTH, WINDOW_INITIAL_HEIGHT } from '../constants'

export interface PreviewBounds {
	width: number
	height: number
}

const DEBOUNCE_VALUE = 200

const usePreviewBounds = (ref: any): PreviewBounds => {
	const [previewBounds, setPreviewBounds] = useState<PreviewBounds>({
		width: WINDOW_INITIAL_WIDTH,
		height: WINDOW_INITIAL_HEIGHT
	})
	const debouncedValue = useDebounce<PreviewBounds>(
		previewBounds,
		DEBOUNCE_VALUE
	)

	const getPreviewBounds = () => {
		if (!ref.current) return
		const rect = ref.current.getBoundingClientRect()

		setPreviewBounds({
			width: rect.width,
			height: rect.height
		})
	}

	useLayoutEffect(() => {
		getPreviewBounds()
	}, [])

	useEffect(() => {
		window.addEventListener('resize', getPreviewBounds)
		return () => {
			window.removeEventListener('resize', getPreviewBounds)
		}
	}, [])

	return debouncedValue
}

export default usePreviewBounds

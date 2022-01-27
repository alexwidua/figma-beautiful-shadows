import { useEffect, useLayoutEffect, useState } from 'preact/hooks'
import useDebounce from './useDebounce'
import { WINDOW_INITIAL_WIDTH, WINDOW_INITIAL_HEIGHT } from '../constants'

export interface PreviewBounds {
	vw: number
	vh: number
}

const usePreviewBounds = (ref: any): PreviewBounds => {
	const [previewBounds, setPreviewBounds] = useState<PreviewBounds>({
		vw: WINDOW_INITIAL_WIDTH,
		vh: WINDOW_INITIAL_HEIGHT
	})
	const debouncedValue = useDebounce<PreviewBounds>(previewBounds, 200)

	const getPreviewBounds = () => {
		if (!ref.current) return
		const rect = ref.current.getBoundingClientRect()

		setPreviewBounds({
			vw: rect.width,
			vh: rect.height
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

import { useLayoutEffect, useEffect, useState } from 'react'
import useDebounce from './useDebounce'

export interface WindowBounds {
	vw: number
	vh: number
}

const useWindowBounds = (): WindowBounds => {
	const [windowBounds, setWindowSize] = useState<WindowBounds>({
		vw: 0,
		vh: 0
	})
	const debouncedValue = useDebounce<WindowBounds>(windowBounds, 200)

	const getWindowBounds = () => {
		setWindowSize({
			vw: window.innerWidth,
			vh: window.innerHeight
		})
	}

	useLayoutEffect(() => {
		getWindowBounds()
	}, [])

	useEffect(() => {
		window.addEventListener('resize', getWindowBounds)
		return () => {
			window.removeEventListener('resize', getWindowBounds)
		}
	}, [])

	return debouncedValue
}

export default useWindowBounds

import { useLayoutEffect, useEffect, useState } from 'react'
import useDebounce from './useDebounce'

export interface WindowSize {
	vw: number
	vh: number
}

const useWindowSize = (): WindowSize => {
	const [windowSize, setWindowSize] = useState<WindowSize>({
		vw: 0,
		vh: 0
	})
	const debouncedValue = useDebounce<WindowSize>(windowSize, 200)

	const getWindowSize = () => {
		setWindowSize({
			vw: window.innerWidth,
			vh: window.innerHeight
		})
	}

	useLayoutEffect(() => {
		getWindowSize()
	}, [])

	useEffect(() => {
		window.addEventListener('resize', getWindowSize)
		return () => {
			window.removeEventListener('resize', getWindowSize)
		}
	}, [])

	return debouncedValue
}

export default useWindowSize

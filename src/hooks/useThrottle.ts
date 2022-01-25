import { useEffect, useRef, useState } from 'preact/hooks'
// import useUnmount from './useUnmount';

const useThrottleFn = <T, U extends any[]>(
	fn: (...args: U) => T,
	ms: number = 200,
	args: U
) => {
	const [state, setState] = useState<T | null>(null)
	const timeout = useRef<ReturnType<typeof setTimeout>>()
	const nextArgs = useRef<U>()

	useEffect(() => {
		if (!timeout.current) {
			setState(fn(...args))
			const timeoutCallback = () => {
				if (nextArgs.current) {
					setState(fn(...nextArgs.current))
					nextArgs.current = undefined
					timeout.current = setTimeout(timeoutCallback, ms)
				} else {
					timeout.current = undefined
				}
			}
			timeout.current = setTimeout(timeoutCallback, ms)
		} else {
			nextArgs.current = args
		}
		return () => {
			timeout.current && clearTimeout(timeout.current)
		}
	}, args)

	return state
}

export default useThrottleFn

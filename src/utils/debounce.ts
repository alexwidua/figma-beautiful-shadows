export function debounce(callback: (...args: any[]) => any, wait: number) {
	let timeout = 0
	return (...args: Parameters<any>): ReturnType<any> => {
		let result: any
		clearTimeout(timeout)
		timeout = setTimeout(() => {
			result = callback(...args)
		}, wait)
		return result
	}
}

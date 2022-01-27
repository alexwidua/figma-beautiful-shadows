export function throttle(fn: Function, wait: number): Function {
	let context: any, args: any, result: any
	let timeout: number | null = null
	let previous = 0

	const later = () => {
		previous = Date.now()

		timeout = null
		result = fn.apply(context, args)
		if (!timeout) context = args = null
	}

	return function () {
		var now = Date.now()
		var remaining = wait - (now - previous)
		// @ts-ignore
		context = this
		args = arguments
		if (remaining <= 0 || remaining > wait) {
			if (timeout) {
				clearTimeout(timeout)
				timeout = null
			}
			previous = now
			result = fn.apply(context, args)
			if (!timeout) context = args = null
		} else if (!timeout) {
			timeout = setTimeout(later, remaining)
		}
		return result
	}
}

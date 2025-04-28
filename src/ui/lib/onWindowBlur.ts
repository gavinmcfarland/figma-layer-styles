export function onWindowBlur(callback: () => void) {
	const handleBlur = () => {
		callback?.()
	}

	window.addEventListener('blur', handleBlur)

	return {
		update(newCallbackFunction: () => void) {
			callback = newCallbackFunction
		},
		destroy() {
			window.removeEventListener('blur', handleBlur)
		},
	}
}

import { selectedStyles } from './stores'

export function onWindowBlur(callback: () => void) {
	const handleBlur = () => {
		// Clear the selectedStyles store
		selectedStyles.set([])
		// Call the original callback if provided
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

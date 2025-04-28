export function clickOutside(element: HTMLElement, callbackFunction: (event: MouseEvent) => void) {
	let callback = callbackFunction

	const onClick = (event: MouseEvent) => {
		const target = event.target as Element

		// For modals: trigger if click is on the dialog backdrop
		if (element.nodeName === 'DIALOG' && target === element) {
			callback(event)
			return
		}

		// For other elements: trigger if click is outside the element
		if (!element.contains(target) && target !== element) {
			callback(event)
		}
	}

	// Use window for event listening to catch all clicks
	window.addEventListener('click', onClick, true)

	return {
		update(newCallbackFunction: (event: MouseEvent) => void) {
			callback = newCallbackFunction
		},
		destroy() {
			window.removeEventListener('click', onClick, true)
		},
	}
}

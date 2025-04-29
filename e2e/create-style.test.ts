import { test, expect } from 'plugma/playwright'

function clearPage() {
	const rects = figma.currentPage.children
	rects.forEach((rect) => {
		rect.remove()
	})
}

test('create style', async ({ ui, main }) => {
	await ui.goto('http://localhost:4000/')

	const rect = await main(() => {
		console.log('Creating rectangle')
		let rect = figma.createRectangle()
		// rect.name = 'Test Rectangle'
		// rect.fills = [
		// 	{
		// 		type: 'SOLID',
		// 		color: { r: 1, g: 0, b: 0 },
		// 	},
		// ]
		// rect.x = 100
		// rect.y = 100
		// rect.cornerRadius = 10

		// figma.currentPage.selection = [rect]

		return rect
	})

	console.log('Rectangle created', rect)

	await ui.locator('#listItem0').click()

	// TODO: Update to use id when button supports id attribute
	await ui.getByRole('button', { name: 'aria-label' }).click()
})

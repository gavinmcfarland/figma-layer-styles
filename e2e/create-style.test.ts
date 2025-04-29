import { test, expect } from 'plugma/playwright'

test('create style', async ({ ui, main }) => {
	await ui.goto('http://localhost:4000/')

	await main(() => {
		let pageChildren = figma.currentPage.children
		figma.currentPage.selection = pageChildren
	})

	// await ui.locator('#listItem0').click()

	// TODO: Update to use id when button supports id attribute
	await ui.getByRole('button', { name: 'aria-label' }).click()
})

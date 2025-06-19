import { test, expect } from 'plugma/playwright'

async function createNodes(main: any) {
	return await main(() => {
		const count = 50 // Stress test with 15 nodes
		const nodes: SceneNode[] = []

		console.log('Clearing page')
		const existingNodes = figma.currentPage.children
		existingNodes.forEach((node) => {
			node.remove()
		})

		// Create multiple nodes
		for (let i = 0; i < count; i++) {
			const TEST_COLOR = {
				r: Math.random(),
				g: Math.random(),
				b: Math.random(),
			}

			const BORDER_RADIUS = Math.random() * 30

			// Randomly select a node type
			const nodeTypes = ['RECTANGLE', 'FRAME', 'COMPONENT'] as const
			const randomType = nodeTypes[Math.floor(Math.random() * nodeTypes.length)]

			let type = randomType

			console.log(`Creating ${type.toLowerCase()} ${i + 1}/${count}`)
			let node: SceneNode

			switch (type) {
				case 'RECTANGLE':
					node = figma.createRectangle()
					node.name = `Test Rectangle ${i + 1}`
					node.fills = [
						{
							type: 'SOLID',
							color: TEST_COLOR,
						},
					]
					node.cornerRadius = BORDER_RADIUS
					break

				case 'FRAME':
					node = figma.createFrame()
					node.name = `Test Frame ${i + 1}`
					node.fills = [
						{
							type: 'SOLID',
							color: TEST_COLOR,
						},
					]
					node.cornerRadius = BORDER_RADIUS
					break

				case 'COMPONENT':
					node = figma.createComponent()
					node.name = `Test Component ${i + 1}`
					node.fills = [
						{
							type: 'SOLID',
							color: TEST_COLOR,
						},
					]
					node.cornerRadius = BORDER_RADIUS
					break
			}

			// Position nodes in a grid layout
			const cols = Math.ceil(Math.sqrt(count))
			const row = Math.floor(i / cols)
			const col = i % cols
			node.x = 100 + col * 200
			node.y = 100 + row * 200

			nodes.push(node)
		}

		// Select all nodes
		figma.currentPage.selection = nodes

		return nodes
	})
}

test('bulk create styles stress test', async ({ ui, main }) => {
	await ui.goto('http://localhost:4000/')

	let nodes!: SceneNode[]

	await test.step('Creating multiple random nodes', async () => {
		nodes = await createNodes(main)
	})

	await test.step('Creating styles for all nodes', async () => {
		// Click the create style button
		await ui.getByRole('button', { name: 'aria-label' }).click()

		// Wait for all style divs to be created and visible
		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i]
			const div = ui.locator(`[data-style-id="${node.id}"]`)
			await expect(div).toBeVisible()
			await expect(div).toContainText(node.name)
		}
	})

	await test.step('Verify all styles were created successfully', async () => {
		// Additional verification that we have the expected number of styles
		const styleDivs = ui.locator('[data-style-id]')
		await expect(styleDivs).toHaveCount(50)
	})
})

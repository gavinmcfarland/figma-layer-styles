import { test, expect } from 'plugma/playwright'

async function createNode(main: any) {
	return await main(() => {
		const TEST_COLOR = {
			r: Math.random(),
			g: Math.random(),
			b: Math.random(),
		}

		// Randomly select a node type
		const nodeTypes = ['RECTANGLE', 'FRAME', 'COMPONENT'] as const
		const randomType = nodeTypes[Math.floor(Math.random() * nodeTypes.length)]

		let type = randomType

		console.log('Clearing page')
		const nodes = figma.currentPage.children
		nodes.forEach((node) => {
			node.remove()
		})

		console.log(`Creating ${type.toLowerCase()}`)
		let node: SceneNode

		switch (type) {
			case 'RECTANGLE':
				node = figma.createRectangle()
				node.name = 'Test Rectangle'
				node.fills = [
					{
						type: 'SOLID',
						color: TEST_COLOR,
					},
				]
				node.cornerRadius = 10
				break

			case 'FRAME':
				node = figma.createFrame()
				node.name = 'Test Frame'
				node.fills = [
					{
						type: 'SOLID',
						color: TEST_COLOR,
					},
				]
				break

			case 'TEXT':
				node = figma.createText()
				node.name = 'Test Text'
				node.characters = 'Hello World'
				node.fills = [
					{
						type: 'SOLID',
						color: TEST_COLOR,
					},
				]
				break

			case 'COMPONENT':
				node = figma.createComponent()
				node.name = 'Test Component'
				node.fills = [
					{
						type: 'SOLID',
						color: TEST_COLOR,
					},
				]
				break
		}

		// Common properties for all nodes
		node.x = 100
		node.y = 100

		figma.currentPage.selection = [node]

		return node
	})
}

test('create style', async ({ ui, main }) => {
	await ui.goto('http://localhost:4000/')

	let node!: SceneNode
	await test.step('Creating random node', async () => {
		node = await createNode(main)
	})

	// TODO: Update to use id when button supports id attribute
	await ui.getByRole('button', { name: 'aria-label' }).click()

	// Add check for div existence
	const div = ui.locator(`[data-style-id="${node.id}"]`)
	await expect(div).toBeVisible()
	await expect(div).toContainText(node.name)
})

import { test, expect } from 'plugma/playwright'

async function createNodes(main: any) {
	return await main(() => {
		const count = 50 // Stress test with 50 nodes
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
			const WIDTH = 100 + Math.random() * 200
			const HEIGHT = 100 + Math.random() * 200

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
					node.resize(WIDTH, HEIGHT)

					// Random fill type (solid, gradient, or image)
					const fillType = Math.random()
					if (fillType < 0.4) {
						// Solid fill
						node.fills = [
							{
								type: 'SOLID',
								color: TEST_COLOR,
								opacity: 0.5 + Math.random() * 0.5, // Random opacity
							},
						]
					} else if (fillType < 0.8) {
						// Gradient fill
						const gradientType = Math.random() < 0.5 ? 'LINEAR' : 'RADIAL'
						const gradientStops = [
							{
								color: { r: Math.random(), g: Math.random(), b: Math.random(), a: 1 },
								position: 0,
							},
							{
								color: { r: Math.random(), g: Math.random(), b: Math.random(), a: 1 },
								position: 1,
							},
						]

						if (gradientType === 'LINEAR') {
							node.fills = [
								{
									type: 'GRADIENT_LINEAR',
									gradientStops,
									gradientTransform: [
										[Math.random(), Math.random(), Math.random()],
										[Math.random(), Math.random(), Math.random()],
									],
								},
							]
						} else {
							node.fills = [
								{
									type: 'GRADIENT_RADIAL',
									gradientStops,
									gradientTransform: [
										[Math.random(), Math.random(), Math.random()],
										[Math.random(), Math.random(), Math.random()],
									],
								},
							]
						}
					} else {
						// No fill
						node.fills = []
					}

					node.cornerRadius = BORDER_RADIUS
					break

				case 'FRAME':
					node = figma.createFrame()
					node.name = `Test Frame ${i + 1}`
					node.resize(WIDTH, HEIGHT)

					// Random fill
					node.fills = [
						{
							type: 'SOLID',
							color: TEST_COLOR,
							opacity: 0.3 + Math.random() * 0.7,
						},
					]
					node.cornerRadius = BORDER_RADIUS
					break

				case 'COMPONENT':
					node = figma.createComponent()
					node.name = `Test Component ${i + 1}`
					node.resize(WIDTH, HEIGHT)

					// Random fill
					node.fills = [
						{
							type: 'SOLID',
							color: TEST_COLOR,
							opacity: 0.4 + Math.random() * 0.6,
						},
					]
					node.cornerRadius = BORDER_RADIUS
					break
			}

			// Add random borders
			if (Math.random() < 0.7) {
				// 70% chance of having borders
				const borderColor = {
					r: Math.random(),
					g: Math.random(),
					b: Math.random(),
				}

				const borderWidth = 1 + Math.random() * 8
				const borderStyle = Math.random() < 0.5 ? 'SOLID' : 'DASHED'

				if (borderStyle === 'SOLID') {
					node.strokes = [
						{
							type: 'SOLID',
							color: borderColor,
							opacity: 0.5 + Math.random() * 0.5,
						},
					]
				} else {
					node.strokes = [
						{
							type: 'SOLID',
							color: borderColor,
							opacity: 0.5 + Math.random() * 0.5,
						},
					]
					node.dashPattern = [5 + Math.random() * 10, 2 + Math.random() * 5]
				}

				node.strokeWeight = borderWidth
			}

			// Add random effects
			if (Math.random() < 0.4) {
				// 40% chance of having effects
				const effects: Effect[] = []

				// Random shadow
				if (Math.random() < 0.6) {
					effects.push({
						type: 'DROP_SHADOW',
						color: { r: 0, g: 0, b: 0, a: 0.1 + Math.random() * 0.3 },
						offset: { x: Math.random() * 10, y: Math.random() * 10 },
						radius: Math.random() * 20,
						visible: true,
						blendMode: 'NORMAL',
					})
				}

				// Random blur
				if (Math.random() < 0.3) {
					effects.push({
						type: 'LAYER_BLUR',
						radius: 1 + Math.random() * 10,
						visible: true,
					})
				}

				if (effects.length > 0) {
					node.effects = effects
				}
			}

			// Add random constraints
			if (Math.random() < 0.5) {
				node.constraints = {
					horizontal: Math.random() < 0.5 ? 'MIN' : 'STRETCH',
					vertical: Math.random() < 0.5 ? 'MIN' : 'STRETCH',
				}
			}

			// Add random layout properties for frames and components
			if (type === 'FRAME' || type === 'COMPONENT') {
				if (Math.random() < 0.6) {
					const frameNode = node as FrameNode | ComponentNode
					frameNode.layoutMode = Math.random() < 0.5 ? 'HORIZONTAL' : 'VERTICAL'
					frameNode.primaryAxisSizingMode = Math.random() < 0.5 ? 'AUTO' : 'FIXED'
					frameNode.counterAxisSizingMode = Math.random() < 0.5 ? 'AUTO' : 'FIXED'
					frameNode.paddingLeft = Math.random() * 20
					frameNode.paddingRight = Math.random() * 20
					frameNode.paddingTop = Math.random() * 20
					frameNode.paddingBottom = Math.random() * 20
					frameNode.itemSpacing = Math.random() * 20
				}
			}

			// Position nodes in a grid layout
			const cols = Math.ceil(Math.sqrt(count))
			const row = Math.floor(i / cols)
			const col = i % cols
			node.x = 100 + col * 250
			node.y = 100 + row * 250

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

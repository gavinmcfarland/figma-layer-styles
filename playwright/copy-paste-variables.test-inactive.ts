import { test, expect } from 'plugma/playwright'
import { copyPaste } from '../src/code/copyPaste'

async function createRectangleWithVariable(main: any) {
	return await main(async () => {
		// Clear the page
		const nodes = figma.currentPage.children
		nodes.forEach((node) => {
			node.remove()
		})

		// Create a variable collection
		const collection = figma.variables.createVariableCollection('Test Collection')
		const modeId = collection.modes[0].modeId

		// Create a variable for corner radius
		const cornerRadiusVariable = figma.variables.createVariable('corner-radius', collection, 'FLOAT')
		cornerRadiusVariable.setValueForMode(modeId, 20)

		// Create a rectangle
		const rectangle = figma.createRectangle()
		rectangle.name = 'Test Rectangle with Variable'
		rectangle.resize(100, 100)
		rectangle.x = 100
		rectangle.y = 100

		// Bind the variable to the corner radius - use the correct field name
		rectangle.setBoundVariable('cornerRadius' as any, cornerRadiusVariable)

		figma.currentPage.selection = [rectangle]

		return { rectangle, variable: cornerRadiusVariable }
	})
}

async function createTargetRectangle(main: any) {
	return await main(() => {
		const rectangle = figma.createRectangle()
		rectangle.name = 'Target Rectangle'
		rectangle.resize(100, 100)
		rectangle.x = 300
		rectangle.y = 100
		rectangle.cornerRadius = 0 // Start with no corner radius

		return rectangle
	})
}

test('copy paste with variableConsumptionMap', async ({ ui, main }) => {
	let sourceNode: any
	let targetNode: any
	let variable: any

	await test.step('Creating source rectangle with variable', async () => {
		const result = await createRectangleWithVariable(main)
		sourceNode = result.rectangle
		variable = result.variable
	})

	await test.step('Creating target rectangle', async () => {
		targetNode = await createTargetRectangle(main)
	})

	await test.step('Copying properties from source to target', async () => {
		await main(() => {
			// Copy properties from source to target
			copyPaste(sourceNode, targetNode)
		})
	})

	await test.step('Verifying variable binding', async () => {
		await main(() => {
			// Check if the target node has the variable bound
			expect(targetNode.boundVariables).toBeDefined()
			expect(targetNode.boundVariables.cornerRadius).toBeDefined()
			expect(targetNode.boundVariables.cornerRadius.id).toBe(variable.id)

			// Check if the corner radius value is applied
			expect(targetNode.cornerRadius).toBe(20)
		})
	})
})

test('copy paste to empty object with variableConsumptionMap', async ({ ui, main }) => {
	let sourceNode: any
	let variable: any

	await test.step('Creating source rectangle with variable', async () => {
		const result = await createRectangleWithVariable(main)
		sourceNode = result.rectangle
		variable = result.variable
	})

	await test.step('Copying to empty object', async () => {
		const result = await main(() => {
			// Copy to empty object
			const emptyObj = {}
			const copiedObj = copyPaste(sourceNode, emptyObj)

			return copiedObj
		})

		// Verify the object contains the variableConsumptionMap
		expect(result.variableConsumptionMap).toBeDefined()
		expect(result.variableConsumptionMap.RECTANGLE_CORNER_RADIUS).toBeDefined()
		expect(result.variableConsumptionMap.RECTANGLE_CORNER_RADIUS.value).toBe(variable.id)
	})
})

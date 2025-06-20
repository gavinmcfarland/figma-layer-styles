/// <reference types="@figma/plugin-typings" />

import { nodeRemovedByUser, centerInViewport, sortNodesByPosition } from './helpers'
import { getPageNode } from './getPageNode'
import { copyPaste } from './copyPaste'
// TODO: Check and update layer style previews when UI opens
// TODO: When editing a layer style, check that the node is a component and if it's been deleted by user

const styleProps = [
	// 'constrainProportions',
	// 'layoutAlign',
	// 'layoutGrow',
	'opacity',
	'blendMode',
	'effects',
	'effectStyleId',
	// 'expanded',
	'backgrounds',
	'backgroundStyleId',
	'fills',
	'strokes',
	'strokeWeight',
	'strokeTopWeight',
	'strokeBottomWeight',
	'strokeRightWeight',
	'strokeLeftWeight',
	'strokeMiterLimit',
	'strokeAlign',
	'strokeCap',
	'strokeJoin',
	'dashPattern',
	'fillStyleId',
	'strokeStyleId',
	'cornerRadius',
	'cornerSmoothing',
	'topLeftRadius',
	'topRightRadius',
	'bottomLeftRadius',
	'bottomRightRadius',
	// 'layoutMode',
	// 'primaryAxisSizingMode',
	// 'counterAxisSizingMode',
	// 'primaryAxisAlignItems',
	// 'counterAxisAlignItems',
	'paddingLeft',
	'paddingRight',
	'paddingTop',
	'paddingBottom',
	'itemSpacing',
	'layoutGrids',
	'gridStyleId',
	// 'clipsContent',
	// 'guides'
]

function copyPasteStyle(source: any, target?: any) {
	if (target) {
		let style = copyPaste(source, target, {
			include: styleProps,
			exclude: [
				'autoRename',
				'characters',
				'fontName',
				'fontSize',
				'rotation',
				'primaryAxisSizingMode',
				'counterAxisSizingMode',
				'primaryAxisAlignItems',
				'counterAxisAlignItems',
				'constrainProportions',
				'layoutAlign',
				'layoutGrow',
				'layoutMode',
			],
		})
		// console.log('style 1', style)
		return style
	} else {
		let style = copyPaste(source, {})
		// console.log('style 2', style)
		return style
	}
}

function getInstances(styleId?: string) {
	return figma.root.findAll((node) => node.getPluginData('styleId') === styleId)
}

function addInstance(styleId: string, nodeId: string) {
	var instances = getInstances(styleId)

	instances.push(nodeId as any)

	figma.root.setPluginData('layerStyle' + styleId, JSON.stringify(instances))
}

// TODO: Need to add a limit, incase user tries to add too many layer styles at once
async function addLayerStyle(node: SceneNode) {
	var layerStyles: any = getLayerStyles()

	for (let i = 0; i < layerStyles.length; i++) {
		var layerStyle = layerStyles[i]

		if (layerStyle.id === node.id) {
			// console.log('Layer style already exists')
			figma.notify('Layer style already exists')
			return
		}
	}

	var newLayerStyle = {
		id: node.id,
		node: copyPasteStyle(node),
		name: node.name,
	}

	layerStyles.push(newLayerStyle)

	figma.root.setPluginData('styles', JSON.stringify(layerStyles))
}

function updateLayerStyle(id: string, name?: string, properties?: any, newId?: string) {
	var styles = getLayerStyles()

	styles.map((obj: any) => {
		if (obj.id == id) {
			if (name) {
				obj.name = name
			}
			if (properties) {
				obj.node = properties
			}
			if (newId) {
				obj.id = newId
			}
		}
	})

	figma.root.setPluginData('styles', JSON.stringify(styles))
}

function getLayerStyles(id?: string) {
	var styles: any = figma.root.getPluginData('styles')

	if (styles !== '') {
		styles = JSON.parse(styles)
	} else {
		styles = []
	}

	if (id) {
		var newStyles = styles.filter(function (style: any) {
			return style.id === id
		})

		styles = newStyles[0]
	}

	return styles
}

function updateInstances(selection: SceneNode[], id?: string) {
	// console.log('updateInstances', selection, id)
	// Find nodes that should be updated with new properties
	var nodes: SceneNode[] = []

	if (selection) {
		nodes = selection
	}

	if (id) {
		nodes = []
		var pages = figma.root.children
		var length = pages.length
		for (let i = 0; i < length; i++) {
			pages[i].findAll((node) => {
				if (node.getPluginData('styleId') === id) {
					// Validate node still exists and is accessible
					if (!nodeRemovedByUser(node)) {
						// Exclude the master node (the node that stores the layer style)
						// The master node has its own id as the styleId
						if (node.id !== id) {
							nodes.push(node)
						}
					} else {
						// Node is no longer valid, clear its styleId
						node.setPluginData('styleId', '')
					}
				}
				return false
			})
		}
	}

	// For each node
	for (let i = 0; i < nodes.length; i++) {
		var node = nodes[i]
		var styleId = node.getPluginData('styleId')

		// Look for node with matching styleID
		var source = figma.getNodeById(styleId)
		var layerStyle

		if (source && !nodeRemovedByUser(source)) {
			layerStyle = source
			updateLayerStyle(styleId, undefined, copyPasteStyle(layerStyle))
			copyPasteStyle(layerStyle, node)
		} else {
			var layerStyleData = getLayerStyles(styleId)
			if (layerStyleData) {
				layerStyle = layerStyleData.node
				copyPasteStyle(layerStyle, node)
			} else {
				// console.log('Layer style not found for styleId:', styleId)
				// Remove the invalid styleId from the node
				node.setPluginData('styleId', '')
			}
			// console.log("Original node can't be found")
		}
	}

	// Commit undo after updating instances
	if (nodes.length > 0) {
		figma.commitUndo()
	}

	// figma.closePlugin()
}

export function clearLayerStyle() {
	figma.root.setPluginData('styles', '')
	// console.log('Styles cleared')
	figma.closePlugin()
}

async function createStyles(selection: SceneNode[]) {
	if (selection.length > 0) {
		if (selection.length <= 500) {
			selection = sortNodesByPosition(selection)
			for (var i = 0; i < selection.length; i++) {
				var node = selection[i]
				node.setPluginData('styleId', node.id)
				// var target = pasteProperties(figma.createFrame(), styles)
				// node.setRelaunchData({ updateStyles: 'Refresh layers connected to this style' });
				// figma.viewport.scrollAndZoomIntoView([target]);
				// console.log(node)
				addLayerStyle(node)
			}
		} else {
			figma.notify('Limited to 500 layer styles at a time')
		}
	} else {
		figma.notify('No layers selected')
	}
}

function applyLayerStyle(selection: SceneNode[], styleId: string) {
	// TODO: If node already has styleId and it matches it's node.id this means it is the master node for another style. Not sure how to fix this, as other style will look to this node for it. Possible fix is to change style ID of node.
	var layerStyle
	var layerStyleData = getLayerStyles(styleId)

	// Check if the layer style exists
	if (!layerStyleData) {
		figma.notify('Layer style not found')
		return
	}

	layerStyle = layerStyleData.node
	var source = figma.getNodeById(styleId)
	if (selection.length <= 500) {
		if (selection.length > 0) {
			for (let i = 0; i < selection.length; i++) {
				var node = selection[i]
				node.setPluginData('styleId', styleId)
				node.setRelaunchData({
					detachLayerStyle: 'Removes association with layer style',
				})

				// var styleId = node.getPluginData("styleId")

				// Look for node with matching styleID

				if (source) {
					layerStyle = source

					copyPasteStyle(layerStyle, node)
				} else {
					copyPasteStyle(layerStyle, node)
					// console.log("Original node can't be found")
				}
			}
			figma.notify('Layer style applied')
			figma.commitUndo()
		} else {
			figma.notify('Please select a layer')
		}
	} else {
		figma.notify('Limited to 500 layers at a time')
	}
}

export function removeLayerStyle(styleId: string) {
	var styles = getLayerStyles()

	// Find the index of the layer style with matching node
	var styleIndex = styles.findIndex((node: any) => {
		return node.id === styleId
	})

	// Only remove if the style was found
	if (styleIndex !== -1) {
		styles.splice(styleIndex, 1)
		// Set layer styles again
		figma.root.setPluginData('styles', JSON.stringify(styles))
	} else {
		console.log('Layer style not found for removal:', styleId)
	}

	// Remove plugin data from all nodes with matching style id
	// var pages = figma.root.children
	// var length = pages.length;
	// for (let i = 0; i < length; i++) {
	// 	pages[i].findAll(node => {
	// 		if (node.getPluginData("styleId") === styleId) {
	// 			node.setPluginData("styleId", "")
	// 		}
	// 	})
	// }

	figma.root.findAll((node) => {
		if (node.getPluginData('styleId') === styleId) {
			node.setPluginData('styleId', '')
		}
		return false
	})

	// Commit undo after removing layer style
	figma.commitUndo()

	// TODO: Remove relaunch data
}

function detachLayerStyle(node: SceneNode) {
	node.setPluginData('styleId', '')
	node.setRelaunchData({})
}

function postStyleList() {
	var styles = getLayerStyles()

	figma.ui.postMessage({
		type: 'STYLE_LIST',
		styles,
	})
}

function debounce(func: Function, wait: number, immediate?: boolean) {
	var timeout: any
	return function (this: any) {
		var context = this,
			args = arguments
		var later = function () {
			timeout = null
			if (!immediate) func.apply(context, args)
		}
		var callNow = immediate && !timeout
		clearTimeout(timeout)
		timeout = setTimeout(later, wait)
		if (callNow) func.apply(context, args)
	}
}

// This updates preview inside layer styles list
// TODO: Need to be careful if something happens to node while it's being watched, for example if it's deleted

// The node being edited - use ID instead of direct reference to prevent memory leaks
var nodeBeingEditedId: string | null = null
var previewIntervalId: number | null = null

function checkNodeBeingEdited(selection: SceneNode[]) {
	if (selection && selection.length === 1) {
		var node = selection[0]
		if (node.id === node.getPluginData('styleId')) {
			nodeBeingEditedId = node.id
		}
	}
}

function getNodeBeingEdited(): SceneNode | null {
	if (!nodeBeingEditedId) return null

	const node = figma.getNodeById(nodeBeingEditedId)
	if (!node || nodeRemovedByUser(node)) {
		// Node no longer exists, clear the reference
		nodeBeingEditedId = null
		clearPreviewInterval()
		return null
	}

	return node as SceneNode
}

function updatePreview() {
	const nodeBeingEdited = getNodeBeingEdited()
	if (nodeBeingEdited) {
		var layerStyleId = nodeBeingEdited.getPluginData('styleId')
		var properties = copyPasteStyle(nodeBeingEdited)

		updateLayerStyle(layerStyleId, undefined, properties)
		postStyleList()
	}
}

function clearPreviewInterval() {
	if (previewIntervalId !== null) {
		clearInterval(previewIntervalId)
		previewIntervalId = null
	}
}

function clearNodeBeingEdited() {
	nodeBeingEditedId = null
	clearPreviewInterval()
}

// Cleanup function to be called when plugin closes or reloads
export function cleanupPlugin() {
	clearNodeBeingEdited()
	// Clear any other global references here if needed
}

export default function () {
	// clearLayerStyle()

	// Cleanup on plugin start to ensure clean state
	cleanupPlugin()

	figma.on('selectionchange', () => {
		// Clear any existing preview interval
		clearPreviewInterval()

		// Post selection to UI and set current node being edited

		var node = figma.currentPage.selection[0]
		var styleId

		if (node) {
			if (node.id === node.getPluginData('styleId')) {
				styleId = node.getPluginData('styleId')
				nodeBeingEditedId = node.id
			}
		}

		figma.ui.postMessage({
			type: 'CURRENT_SELECTION',
			selection: {
				styleId,
			},
		})

		if (nodeBeingEditedId) {
			previewIntervalId = setInterval(() => {
				updatePreview()
			}, 600)
		}
		// If user unselects then change node being edited to null
		if (figma.currentPage.selection.length === 0) {
			clearNodeBeingEdited()
		}
	})

	if (figma.command === 'showStyles') {
		// This shows the HTML page in "ui.html".
		figma.showUI(__html__, { width: 240, height: 360, themeColors: true })

		// Calls to "parent.postMessage" from within the HTML page will trigger this
		// callback. The callback will be passed the "pluginMessage" property of the
		// posted message.
		figma.ui.onmessage = (msg) => {
			if (msg.type === 'UI_READY') {
				postStyleList()
			}

			if (msg.type === 'add-style') {
				createStyles([...figma.currentPage.selection])
				postStyleList()
			}

			if (msg.type === 'rename-style') {
				updateLayerStyle(msg.id, msg.name)
				postStyleList()
			}

			if (msg.type === 'update-instances') {
				updateInstances([...figma.currentPage.selection], msg.id)
				postStyleList()
			}

			if (msg.type === 'update-style') {
				var node = figma.currentPage.selection[0]
				var properties = copyPasteStyle(node)
				updateLayerStyle(msg.id, undefined, properties, node.id)
				figma.currentPage.selection[0].setPluginData('styleId', node.id)
				figma.commitUndo()
				postStyleList()
			}

			if (msg.type === 'edit-layer-style') {
				var foundNode: SceneNode | null = figma.getNodeById(msg.id) as SceneNode | null
				if (foundNode && !nodeRemovedByUser(foundNode)) {
					figma.viewport.scrollAndZoomIntoView([foundNode])
					figma.viewport.zoom = 0.25
					figma.currentPage = getPageNode(foundNode)
					figma.currentPage.selection = [foundNode]
				} else {
					// If orginal node can't be found anymore
					var newNode = figma.createFrame()
					var newStyleId = newNode.id
					var properties = getLayerStyles(msg.id)

					if (properties) {
						copyPasteStyle(properties.node, newNode)
						centerInViewport(newNode)
						newNode.name = `${properties.name}`
						figma.viewport.scrollAndZoomIntoView([newNode])
						figma.viewport.zoom = 0.25
						// figma.viewport.scrollAndZoomIntoView([node])

						// Set as the new master layer style
						newNode.setPluginData('styleId', newNode.id)

						updateLayerStyle(msg.id, undefined, undefined, newNode.id)

						// Update instances with new style id
						var instances = getInstances(msg.id)

						instances.map((node) => {
							node.setPluginData('styleId', newStyleId)
						})

						figma.currentPage.selection = [newNode]

						// Commit undo after creating new node and updating instances
						figma.commitUndo()
					} else {
						figma.notify('Layer style not found')
					}
				}
				postStyleList()
			}

			if (msg.type === 'apply-style') {
				applyLayerStyle([...figma.currentPage.selection], msg.id)
			}

			if (msg.type === 'remove-style') {
				removeLayerStyle(msg.id)
				postStyleList()
			}

			// Make sure to close the plugin when you're done. Otherwise the plugin will
			// keep running, which shows the cancel button at the bottom of the screen.
		}
	}

	if (figma.command === 'createStyles') {
		createStyles([...figma.currentPage.selection])

		figma.closePlugin()
	}

	if (figma.command === 'updateStyles') {
		updateInstances([...figma.currentPage.selection])
		figma.closePlugin()
	}

	if (figma.command === 'clearLayerStyles') {
		clearLayerStyle()
	}

	if (figma.command === 'copyProperties') {
		copyPasteStyle(figma.currentPage.selection[0])
		// figma.closePlugin()
	}

	if (figma.command === 'detachLayerStyle') {
		for (var i = 0; i < figma.currentPage.selection.length; i++) {
			var node = figma.currentPage.selection[i]
			detachLayerStyle(node)
		}
		figma.notify('Layer style detached')
		figma.commitUndo()
		figma.closePlugin()
	}
}

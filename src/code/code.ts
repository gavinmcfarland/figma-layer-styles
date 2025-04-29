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
		return copyPaste(source, target, {
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
	} else {
		return copyPaste(source, {})
	}
}

function getInstances(styleId?) {
	return figma.root.findAll((node) => node.getPluginData('styleId') === styleId)
}

function addInstance(styleId, nodeId) {
	var instances = getInstances(styleId)

	instances.push(nodeId)

	figma.root.setPluginData('layerStyle' + styleId, JSON.stringify(instances))
}

// TODO: Need to add a limit, incase user tries to add too many layer styles at once
async function addLayerStyle(node) {
	var layerStyles: any = getLayerStyles()

	for (let i = 0; i < layerStyles.length; i++) {
		var layerStyle = layerStyles[i]

		if (layerStyle.id === node.id) {
			console.log('Layer style already exists')
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

function updateLayerStyle(id, name?, properties?, newId?) {
	var styles = getLayerStyles()

	styles.map((obj) => {
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

function getLayerStyles(id?) {
	var styles: any = figma.root.getPluginData('styles')

	if (styles !== '') {
		styles = JSON.parse(styles)
	} else {
		styles = []
	}

	if (id) {
		var newStyles = styles.filter(function (style) {
			return style.id === id
		})

		styles = newStyles[0]
	}

	return styles
}

function updateInstances(selection, id?) {
	// Find nodes that should be updated with new properties
	var nodes

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
					nodes.push(node)
				}
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

		if (source) {
			layerStyle = source
			updateLayerStyle(styleId, null, copyPasteStyle(layerStyle))
			copyPasteStyle(layerStyle, node)
		} else {
			layerStyle = getLayerStyles(styleId).node
			copyPasteStyle(layerStyle, node)
			console.log("Original node can't be found")
		}
	}

	// figma.closePlugin()
}

function clearLayerStyle() {
	figma.root.setPluginData('styles', '')
	console.log('Styles cleared')
	figma.closePlugin()
}

async function createStyles(selection) {
	if (selection.length > 0) {
		if (selection.length <= 20) {
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
			figma.notify('Limited to 20 layer styles at a time')
		}
	} else {
		figma.notify('No layers selected')
	}
}

function applyLayerStyle(selection, styleId) {
	// TODO: If node already has styleId and it matches it's node.id this means it is the master node for another style. Not sure how to fix this, as other style will look to this node for it. Possible fix is to change style ID of node.
	var layerStyle
	layerStyle = getLayerStyles(styleId).node
	var source = figma.getNodeById(styleId)
	if (selection.length <= 100) {
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
					console.log("Original node can't be found")
				}
			}
			figma.notify('Layer style applied')
		} else {
			figma.notify('Please select a layer')
		}
	} else {
		figma.notify('Limited to 100 layers at a time')
	}
}

function removeLayerStyle(styleId) {
	var styles = getLayerStyles()

	// Remove layer style with matching node
	styles.splice(
		styles.findIndex((node) => {
			return node.id === styleId
		}),
		1,
	)

	// Set layer styles again
	figma.root.setPluginData('styles', JSON.stringify(styles))

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
	})

	// TODO: Remove relaunch data
}

function detachLayerStyle(node) {
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

function debounce(func, wait, immediate?) {
	var timeout
	return function () {
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

// The node being edited
var nodeBeingEdited = null

function checkNodeBeingEdited(selection) {
	if (selection && selection.length === 1) {
		var node = selection[0]
		if (node.id === node.getPluginData('styleId')) {
			nodeBeingEdited = node
		}
	}
}

function updatePreview(nodeBeingEdited) {
	if (nodeBeingEdited) {
		var layerStyleId = nodeBeingEdited.getPluginData('styleId')
		var properties = copyPasteStyle(nodeBeingEdited)

		updateLayerStyle(layerStyleId, null, properties)
		postStyleList()
	}
}

export default function () {
	figma.on('selectionchange', () => {
		// Post selection to UI and set current node being edited

		var node = figma.currentPage.selection[0]
		var styleId

		if (node) {
			if (node.id === node.getPluginData('styleId')) {
				styleId = node.getPluginData('styleId')
				nodeBeingEdited = node
			}
		}

		figma.ui.postMessage({
			type: 'CURRENT_SELECTION',
			selection: {
				styleId,
			},
		})

		if (nodeBeingEdited) {
			setInterval(() => {
				updatePreview(nodeBeingEdited)
			}, 600)
		}
		// If user unselects then change node being edited to null
		if (figma.currentPage.selection.length === 0) {
			nodeBeingEdited = null
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
				console.log('UI_READY')
				postStyleList()
			}

			if (msg.type === 'add-style') {
				createStyles(figma.currentPage.selection)
				postStyleList()
			}

			if (msg.type === 'rename-style') {
				updateLayerStyle(msg.id, msg.name)
				postStyleList()
			}

			if (msg.type === 'update-instances') {
				updateInstances(figma.currentPage.selection, msg.id)
				postStyleList()
			}

			if (msg.type === 'update-style') {
				var node = figma.currentPage.selection[0]
				var properties = copyPasteStyle(node)
				updateLayerStyle(msg.id, null, properties, node.id)
				figma.currentPage.selection[0].setPluginData('styleId', node.id)
				postStyleList()
			}

			if (msg.type === 'edit-layer-style') {
				var node = figma.getNodeById(msg.id)
				if (!nodeRemovedByUser(node)) {
					figma.viewport.scrollAndZoomIntoView([node])
					figma.viewport.zoom = 0.25
					figma.currentPage = getPageNode(node)
					figma.currentPage.selection = [node]
				} else {
					// If orginal node can't be found anymore
					node = figma.createFrame()
					var newStyleId = node.id
					var properties = getLayerStyles(msg.id)

					copyPasteStyle(properties.node, node)
					centerInViewport(node)
					node.name = `${properties.name}`
					figma.viewport.scrollAndZoomIntoView([node])
					figma.viewport.zoom = 0.25
					// figma.viewport.scrollAndZoomIntoView([node])

					// Set as the new master layer style
					node.setPluginData('styleId', node.id)

					updateLayerStyle(msg.id, null, null, node.id)

					// Update instances with new style id
					var instances = getInstances(msg.id)

					instances.map((node) => {
						node.setPluginData('styleId', newStyleId)
					})

					figma.currentPage.selection = [node]
				}
				postStyleList()
			}

			if (msg.type === 'apply-style') {
				applyLayerStyle(figma.currentPage.selection, msg.id)
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
		createStyles(figma.currentPage.selection)

		figma.closePlugin()
	}

	if (figma.command === 'updateStyles') {
		updateInstances(figma.currentPage.selection)
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
		figma.closePlugin()
	}
}

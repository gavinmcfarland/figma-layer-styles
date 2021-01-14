// TODO: Check and update layer style previews when UI opens

const nodeProps: string[] = [
	'id',
	'parent',
	'name',
	'removed',
	'visible',
	'locked',
	'children',
	'constraints',
	'absoluteTransform',
	'relativeTransform',
	'x',
	'y',
	'rotation',
	'width',
	'height',
	'constrainProportions',
	'layoutAlign',
	'layoutGrow',
	'opacity',
	'blendMode',
	'isMask',
	'effects',
	'effectStyleId',
	'expanded',
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
	'exportSettings',
	'overflowDirection',
	'numberOfFixedChildren',
	'overlayPositionType',
	'overlayBackground',
	'overlayBackgroundInteraction',
	'reactions',
	'description',
	'remote',
	'key',
	'layoutMode',
	'primaryAxisSizingMode',
	'counterAxisSizingMode',
	'primaryAxisAlignItems',
	'counterAxisAlignItems',
	'paddingLeft',
	'paddingRight',
	'paddingTop',
	'paddingBottom',
	'itemSpacing',
	// 'horizontalPadding',
	// 'verticalPadding',
	'layoutGrids',
	'gridStyleId',
	'clipsContent',
	'guides'
]

const readonly: string[] = [
	'id',
	'parent',
	'removed',
	'children',
	'absoluteTransform',
	'width',
	'height',
	'overlayPositionType',
	'overlayBackground',
	'overlayBackgroundInteraction',
	'reactions',
	'remote',
	'key',
	'type'
]

const instanceProps: string[] = [
	'rotation',
	'constrainProportions'
]

const defaults: string[] = [
	'name',
	'guides',
	'description',
	'remote',
	'key',
	'reactions',
	'x',
	'y',
	'exportSettings',
	'expanded',
	'isMask',
	'exportSettings',
	'overflowDirection',
	'numberOfFixedChildren',
	'constraints',
	'relativeTransform'
]

function copyPasteProps(source, target?, { include, exclude }: Options = {}) {
	let allowlist: string[] = nodeProps.filter(function (el) {
		return !defaults.concat(readonly).includes(el)
	})

	if (include) {
		allowlist = allowlist.concat(include)
	}

	if (exclude) {
		allowlist = allowlist.filter(function (el) {
			return !exclude.includes(el)
		})
	}

	if (target?.parent.type === "INSTANCE") {
		allowlist = allowlist.filter(function (el) {
			return !instanceProps.includes(el)
		})
	}

	const val = source
	const type = typeof source

	if (
		type === 'undefined' ||
		type === 'number' ||
		type === 'string' ||
		type === 'boolean' ||
		type === 'symbol' ||
		source === null
	) {
		return val
	} else if (type === 'object') {
		if (val instanceof Array) {
			var newArray = []
			for (const key1 in source) {
				newArray.push(clone(source[key1]))
			}
			return newArray
			// return val.map(copyPasteProps)
		} else if (val instanceof Uint8Array) {
			return new Uint8Array(val)
		} else {
			const o: any = {}
			for (const key1 in val) {
				if (target) {
					for (const key2 in target) {
						if (allowlist.includes(key2)) {
							if (key1 === key2) {
								// if (Array.isArray(val[key1]) && val[key1].length === 0) {

								// }
								// else {

								// 	if (key1 === "fills") {
								// 		console.log("fill opacity is less than 1")
								// 	}
								// 	else {
								o[key1] = copyPasteProps(val[key1], target)
								// 	}

								// }
							}
						}
					}
				} else {
					o[key1] = copyPasteProps(val[key1])
				}
			}

			if (target) {
				!o.fillStyleId && o.fills ? null : delete o.fills
				!o.strokeStyleId && o.strokes ? null : delete o.strokes
				!o.backgroundStyleId && o.backgrounds ? null : delete o.backgrounds

				if (o.cornerRadius !== figma.mixed) {
					delete o.topLeftRadius
					delete o.topRightRadius
					delete o.bottomLeftRadius
					delete o.bottomRightRadius
				}
				else {
					delete o.cornerRadius
				}

				return Object.assign(target, o)
			}
			else {
				return o
			}

		}
	}

	throw 'unknown'
}

function clone(val) {
	return JSON.parse(JSON.stringify(val))
}

interface Options {
	include?: string[]
	exclude?: string[]
}

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
	'gridStyleId'
	// 'clipsContent',
	// 'guides'
]

function copyPasteStyle(source, target?) {
	return copyPasteProps(source, target, {
		include: styleProps, exclude: ['autoRename', 'characters', 'fontName', 'fontSize', 'rotation', 'primaryAxisSizingMode',
			'counterAxisSizingMode',
			'primaryAxisAlignItems',
			'counterAxisAlignItems',
			'constrainProportions',
			'layoutAlign',
			'layoutGrow']
	})
}

function pageId(node) {
	if (node.parent.type === "PAGE") {
		return node.parent.id
	}
	else {
		return pageId(node.parent)
	}
}

function pageNode(node) {
	if (node.parent.type === "PAGE") {
		return node.parent
	}
	else {
		return pageNode(node.parent)
	}
}



function centerInViewport(node) {
	// Position newly created table in center of viewport
	node.x = figma.viewport.center.x - (node.width / 2)
	node.y = figma.viewport.center.y - (node.height / 2)
}

function sortNodesByPosition(nodes) {

	var result = nodes.map((x) => x)

	result.sort((current, next) => current.x - next.x)

	return result.sort((current, next) => current.y - next.y);
}

function getInstances(styleId?) {
	return figma.root.findAll((node) => node.getPluginData("styleId") === styleId)
}

function addInstance(styleId, nodeId) {
	var instances = getInstances(styleId)

	instances.push(nodeId)

	figma.root.setPluginData("layerStyle" + styleId, JSON.stringify(instances))
}

// TODO: Need to add a limit, incase user tries to add too many layer styles at once
function addLayerStyle(node) {

	var layerStyles: any = getLayerStyles()

	for (let i = 0; i < layerStyles.length; i++) {
		var layerStyle = layerStyles[i]

		if (layerStyle.id === node.id) {
			console.log("Layer style already exists")
			figma.notify("Layer style already exists")
			return
		}
	}



	var layerStyle = { id: node.id, node: copyPasteStyle(node), name: node.name }

	layerStyles.push(layerStyle)

	figma.root.setPluginData("styles", JSON.stringify(layerStyles))


}

function updateLayerStyle(id, name?, properties?, newId?) {
	var styles = getLayerStyles()

	styles.map((obj) => {
		if (obj.id == id) {
			if (name) {
				obj.name = name;
			}
			if (properties) {
				obj.node = properties;
			}
			if (newId) {
				obj.id = newId;
			}

		}
	})

	figma.root.setPluginData("styles", JSON.stringify(styles))
}

function getLayerStyles(id?) {
	var styles: any = figma.root.getPluginData("styles")

	if (styles !== "") {
		styles = JSON.parse(styles)
	}
	else {
		styles = []
	}

	if (id) {
		var newStyles = styles.filter(function (style) {
			return style.id === id
		});

		styles = newStyles[0]

	}


	return styles
}





function updateInstances(selection, id?) {

	// Find nodes that should be updated with new properties
	var nodes;

	if (selection) {
		nodes = selection
	}

	if (id) {
		nodes = []
		var pages = figma.root.children
		var length = pages.length;
		for (let i = 0; i < length; i++) {
			pages[i].findAll(node => {
				if (node.getPluginData("styleId") === id) {
					nodes.push(node)
				}
			})
		}

		//// This method is a lot slower!!!
		// var instances = getInstances(thisNode.getPluginData("styleId"))

		// for (var i = 0; i < instances.length; i++) {
		// 	var instanceId = instances[i]
		// 	nodes.push(figma.getNodeById(instanceId))
		// }

	}





	// For each node
	for (let i = 0; i < nodes.length; i++) {
		var node = nodes[i]
		var styleId = node.getPluginData("styleId")

		// Look for node with matching styleID
		var source = figma.getNodeById(styleId)

		if (source) {
			var layerStyle = source
			updateLayerStyle(styleId, null, copyPasteStyle(layerStyle));
			copyPasteStyle(layerStyle, node)
		}
		else {
			var layerStyle = getLayerStyles(styleId).node
			copyPasteStyle(layerStyle, node)
			console.log("Original node can't be found")
		}
	}

	// figma.closePlugin()

}

function clearLayerStyle() {
	figma.root.setPluginData("styles", "")
	console.log("Styles cleared")
	figma.closePlugin()
}

function createStyles(selection) {
	if (selection.length > 0) {
		selection = sortNodesByPosition(selection)
		for (var i = 0; i < selection.length; i++) {
			var node = selection[i]
			node.setPluginData("styleId", node.id)
			// var target = pasteProperties(figma.createFrame(), styles)
			// node.setRelaunchData({ updateStyles: 'Refresh layers connected to this style' });
			// figma.viewport.scrollAndZoomIntoView([target]);

			addLayerStyle(node)
		}
	}
	else {
		figma.notify("No nodes selected")
	}
}

function applyLayerStyle(selection, styleId) {
	// TODO: If node already has styleId and it matches it's node.id this means it is the master node for another style. Not sure how to fix this, as other style will look to this node for it. Possible fix is to change style ID of node.


	for (let i = 0; i < selection.length; i++) {
		var node = selection[i]
		node.setPluginData("styleId", styleId)
		node.setRelaunchData({ detachLayerStyle: 'Removes association with layer style' })

		// var styleId = node.getPluginData("styleId")

		// Look for node with matching styleID
		var source = figma.getNodeById(styleId)

		if (source) {

			var layerStyle = source

			copyPasteStyle(layerStyle, node)
		}
		else {
			var layerStyle = getLayerStyles(styleId).node
			copyPasteStyle(layerStyle, node)
			console.log("Original node can't be found")
		}

	}

	figma.notify("Layer style applied")
}

function removeLayerStyle(styleId) {
	var styles = getLayerStyles()

	// Remove layer style with matching node
	styles.splice(styles.findIndex(node => {
		return node.id === styleId;
	}), 1);

	// Set layer styles again
	figma.root.setPluginData("styles", JSON.stringify(styles))

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

	figma.root.findAll(node => {
		if (node.getPluginData("styleId") === styleId) {
			node.setPluginData("styleId", "")
		}
	})

	// TODO: Remove relaunch data
}

function detachLayerStyle(node) {
	node.setPluginData("styleId", "")
	node.setRelaunchData({})
}


function postMessage() {
	var styles = getLayerStyles();
	var message = styles

	figma.ui.postMessage(message)
}



// This updates preview inside layer styles list
// TODO: Need to be careful if something happens to node while it's being watched, for example if it's deleted
var thisNode;

figma.on("selectionchange", () => {
	console.log("Selection changed")

	var node = figma.currentPage.selection[0]
	if (node) {
		if (node.getPluginData("styleId") !== "") {
			console.log("Selection has a layer style")
			if (node.id === node.getPluginData("styleId")) {
				console.log("Selection is master")
				thisNode = node
			}
		}
	}
	else {
		thisNode = null
	}
})



function update(thisNode) {

	if (thisNode) {
		var layerStyleId = thisNode.getPluginData("styleId")
		var properties = copyPasteStyle(thisNode)
		updateLayerStyle(layerStyleId, null, properties);
		postMessage()
	}

}

setInterval(() => {
	update(thisNode)


	// This live updates all instances with new style. Performance is a bit sluggish. Might be possible to speed it up if I stored an array of node ids which have layer style applied and then searched for node using getNodeById
	// if (thisNode) {
	// 	updateInstances(null, thisNode.id)
	// }
	// TODO: Remove plugin data from all nodes with matching style id
}, 600)





if (figma.command === "showStyles") {
	// This shows the HTML page in "ui.html".
	figma.showUI(__html__, { width: 240, height: 360 });

	postMessage()

	// Calls to "parent.postMessage" from within the HTML page will trigger this
	// callback. The callback will be passed the "pluginMessage" property of the
	// posted message.
	figma.ui.onmessage = msg => {

		if (msg.type === "add-style") {
			createStyles(figma.currentPage.selection)
			postMessage()
		}

		if (msg.type === "rename-style") {
			updateLayerStyle(msg.id, msg.name)
			postMessage()
		}

		if (msg.type === "update-instances") {
			updateInstances(figma.currentPage.selection, msg.id)
			postMessage()
		}

		if (msg.type === "update-style") {
			var node = figma.currentPage.selection[0]
			var properties = copyPasteStyle(node)
			updateLayerStyle(msg.id, null, properties, node.id)
			figma.currentPage.selection[0].setPluginData("styleId", node.id)
			postMessage()
		}

		if (msg.type === "edit-layer-style") {
			var node = figma.getNodeById(msg.id)
			if (node) {
				figma.viewport.scrollAndZoomIntoView([node])
				figma.viewport.zoom = 0.25
				figma.currentPage = pageNode(node)
				figma.currentPage.selection = [node]
			}
			else {
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
				node.setPluginData("styleId", node.id)


				updateLayerStyle(msg.id, null, null, node.id)

				// Update instances with new style id
				var instances = getInstances(msg.id)

				console.log(instances)
				instances.map((node) => {
					node.setPluginData("styleId", newStyleId)
				})

				figma.currentPage.selection = [node]
			}
			postMessage()
		}

		if (msg.type === "apply-style") {
			applyLayerStyle(figma.currentPage.selection, msg.id)
		}

		if (msg.type === "remove-style") {
			removeLayerStyle(msg.id)
			postMessage()
		}

		// Make sure to close the plugin when you're done. Otherwise the plugin will
		// keep running, which shows the cancel button at the bottom of the screen.

	};
}




if (figma.command === "createStyles") {
	createStyles(figma.currentPage.selection)
	figma.closePlugin()
}



if (figma.command === "updateStyles") {
	updateInstances(figma.currentPage.selection)
	figma.closePlugin()
}

if (figma.command === "clearStyles") {
	clearLayerStyle()
}


if (figma.command === "copyProperties") {
	copyPasteStyle(figma.currentPage.selection[0])
	// figma.closePlugin()
}

if (figma.command === "detachLayerStyle") {
	for (var i = 0; i < figma.currentPage.selection.length; i++) {
		var node = figma.currentPage.selection[i]
		detachLayerStyle(node)

	}
	figma.notify("Layer style detached")
	figma.closePlugin()
}

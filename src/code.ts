// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).

function clone(val) {
	return JSON.parse(JSON.stringify(val))
}

function copyStyles(source) {
	var styles = {}

	styles.name = source.name

	if (source.fillStyleId == "") {
		styles.fills = source.fills
	}
	else {
		styles.fillStyleId = source.fillStyleId
	}

	if (source.strokeStyleId == "") {
		styles.strokes = source.strokes
	}
	else {
		styles.strokeStyleId = source.strokeStyleId
	}


	styles.strokeWeight = source.strokeWeight

	styles.strokeAlign = source.strokeAlign
	styles.strokeCap = source.strokeCap
	styles.strokeJoin = source.strokeJoin
	styles.strokeMiterLimit = source.strokeMiterLimit

	if (styles.type !== "INSTANCE") {
		styles.topLeftRadius = source.topLeftRadius
		styles.topRightRadius = source.topRightRadius
		styles.bottomLeftRadius = source.bottomLeftRadius
		styles.bottomRightRadius = source.bottomRightRadius
	}

	styles.dashPattern = source.dashPattern
	styles.clipsContent = source.clipsContent

	styles.effects = clone(source.effects)


	// for (let i = 0; i < current.children.length; i++) {
	// 	styles.appendChild(current.children[i].clone())
	// }

	console.log(styles)

	return styles
}

async function setStyle(object) {

	var styles = await figma.clientStorage.getAsync("styles")

	if (styles) {
		console.log("Getting styles")
	}
	else {
		styles = []
	}

	styles.push(object)

	await figma.clientStorage.setAsync("styles", styles)
}

async function getStyles() {
	var styles = await figma.clientStorage.getAsync("styles")
	return styles
}

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 232, height: 208 });

(async function () {
	var styles = await getStyles();
	var message = styles

	figma.ui.postMessage(message)
})()


// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
	// One way of distinguishing between different types of messages sent from
	// your HTML page is to use an object with a "type" property like this.
	if (msg.type === 'create-shapes') {

		const nodes: SceneNode[] = [];

		for (let i = 0; i < msg.count; i++) {

			var shape;

			if (msg.shape === 'rectangle') {
				shape = figma.createRectangle();
			} else if (msg.shape === 'triangle') {
				shape = figma.createPolygon();
			} else {
				shape = figma.createEllipse();
			}

			shape.x = i * 150;
			shape.fills = [{ type: 'SOLID', color: { r: 1, g: 0.5, b: 0 } }];
			figma.currentPage.appendChild(shape);
			nodes.push(shape);
		}

		figma.currentPage.selection = nodes;
		figma.viewport.scrollAndZoomIntoView(nodes);
		figma.closePlugin();
	}

	function pasteStyles(target, styles) {
		Object.assign(target, styles)

		return target
	}

	if (msg.type === "copy-styles") {
		var styles = copyStyles(figma.currentPage.selection[0])
		var target = pasteStyles(figma.createFrame(), styles)
		figma.viewport.scrollAndZoomIntoView([target]);
		(async function () {
			await setStyle(styles)
			await getStyles()
		})()

	}

	// Make sure to close the plugin when you're done. Otherwise the plugin will
	// keep running, which shows the cancel button at the bottom of the screen.

};

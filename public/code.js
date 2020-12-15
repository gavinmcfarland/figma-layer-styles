'use strict';

// This plugin will open a modal to prompt the user to enter a number, and
function pageNode(node) {
    if (node.parent.type === "PAGE") {
        return node.parent;
    }
    else {
        return pageNode(node.parent);
    }
}
function centerInViewport(node) {
    // Position newly created table in center of viewport
    node.x = figma.viewport.center.x - (node.width / 2);
    node.y = figma.viewport.center.y - (node.height / 2);
}
function getInstances(id) {
    var array = figma.root.getPluginData("layerStyle" + id);
    if (array !== "") {
        array = JSON.parse(array);
    }
    else {
        array = [];
    }
    array.push(id);
    figma.root.setPluginData("layerStyle" + id, JSON.stringify(array));
    return array;
}
function addInstance(styleId, nodeId) {
    var instances = getInstances(styleId);
    instances.push(nodeId);
    figma.root.setPluginData("layerStyle" + styleId, JSON.stringify(instances));
}
function addLayerStyle(node) {
    var layerStyles = getLayerStyles();
    // for (let i = 0; i < layerStyles.length; i++) {
    // 	var layerStyle = layerStyles[i]
    // 	if (layerStyle.id === node.id) {
    // 		console.log("Layer style already exists")
    // 		return
    // 	}
    // }
    layerStyles.push({ id: node.id, node: copyPaste(node), name: node.name });
    figma.root.setPluginData("styles", JSON.stringify(layerStyles));
    addInstance(node.id, node.id);
}
function updateLayerStyle(id, name, properties, newId) {
    var styles = getLayerStyles();
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
    });
    figma.root.setPluginData("styles", JSON.stringify(styles));
}
function getLayerStyles(id) {
    var styles = figma.root.getPluginData("styles");
    if (styles !== "") {
        styles = JSON.parse(styles);
    }
    else {
        styles = [];
    }
    if (id) {
        var newStyles = styles.filter(function (style) {
            return style.id === id;
        });
        styles = newStyles[0];
    }
    return styles;
}
function copyPaste(source, target) {
    var temp = {};
    if (target) {
        temp = target;
    }
    // corner-radius
    // target.cornerSmoothing = source.cornerSmoothing
    if ((target === null || target === void 0 ? void 0 : target.type) !== "TEXT" && (target === null || target === void 0 ? void 0 : target.type) !== "LINE") {
        if (source.cornerRadius === figma.mixed) {
            temp.topLeftRadius = source.topLeftRadius;
            temp.topRightRadius = source.topRightRadius;
            temp.bottomLeftRadius = source.bottomLeftRadius;
            temp.bottomRightRadius = source.bottomRightRadius;
        }
        else {
            temp.cornerRadius = source.cornerRadius;
        }
    }
    // strokes
    source.strokeStyleId === "" ? temp.strokes = source.strokes : temp.strokeStyleId = source.strokeStyleId;
    temp.strokeAlign = source.strokeAlign;
    temp.strokeCap = source.strokeCap;
    temp.strokeJoin = source.strokeJoin;
    temp.strokeMiterLimit = source.strokeMiterLimit;
    temp.strokeStyleId = source.strokeStyleId;
    temp.strokeWeight = source.strokeWeight;
    temp.dashPattern = source.dashPattern;
    // fills
    source.fillStyleId === "" ? temp.fills = source.fills : temp.fillStyleId = source.fillStyleId;
    // effects
    source.effectStyleId === "" ? temp.effects = source.effects : temp.effectStyleId = source.effectStyleId;
    // backgrounds
    if (!target || (target === null || target === void 0 ? void 0 : target.type) === "FRAME" || (target === null || target === void 0 ? void 0 : target.type) === "COMPONENT") {
        source.backgroundStyleId === "" ? temp.backgrounds = source.backgrounds : temp.backgroundStyleId = source.backgroundStyleId;
    }
    if (!target || (target === null || target === void 0 ? void 0 : target.type) !== "FRAME" && (target === null || target === void 0 ? void 0 : target.type) !== "COMPONENT") ;
    // temp.absoluteTransform = source.absoluteTransform
    // temp.blendMode = source.blendMode
    // temp.constrainProportions = source.constrainProportions
    // temp.constraints = source.constraints
    // temp.exportSettings = source.exportSettings
    // temp.id = source.id
    // temp.isMask = source.isMask
    // temp.locked = source.locked
    // temp.name = source.name
    // temp.parent = source.parent
    // temp.children = source.children
    // temp.numberOfFixedChildren = source.numberOfFixedChildren
    // temp.clipsContent = source.clipsContent
    // temp.rotation = source.rotation
    // temp.reactions = source.reactions
    // temp.relativeTransform = source.relativeTransform
    // temp.removed = source.removed
    // temp.rotation = source.rotation
    // temp.opacity = source.opacity
    // temp.expanded = source.expanded
    // temp.visible = source.visible
    // temp.width = source.width
    // temp.height = source.height
    // temp.x = source.x
    // temp.y = source.y
    console.log(temp);
    return temp;
}
function updateInstances(selection, id) {
    // Find nodes that should be updated with new properties
    var nodes;
    if (selection) {
        nodes = selection;
    }
    if (id) {
        nodes = [];
        var pages = figma.root.children;
        var length = pages.length;
        for (let i = 0; i < length; i++) {
            pages[i].findAll(node => {
                if (node.getPluginData("styleId") === id) {
                    nodes.push(node);
                }
            });
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
        var node = nodes[i];
        var styleId = node.getPluginData("styleId");
        // Look for node with matching styleID
        var source = figma.getNodeById(styleId);
        if (source) {
            var layerStyle = source;
            updateLayerStyle(styleId, null, layerStyle);
            copyPaste(layerStyle, node);
        }
        else {
            var layerStyle = getLayerStyles(styleId).node;
            copyPaste(layerStyle, node);
            console.log("Original node can't be found");
        }
    }
    // figma.closePlugin()
}
function clearLayerStyle() {
    figma.root.setPluginData("styles", "");
    console.log("Styles cleared");
    figma.closePlugin();
}
function createStyles(selection) {
    if (selection.length > 0) {
        for (var i = 0; i < selection.length; i++) {
            var node = selection[i];
            node.setPluginData("styleId", node.id);
            // var target = pasteProperties(figma.createFrame(), styles)
            node.setRelaunchData({ updateStyles: 'Update from component styles' });
            // figma.viewport.scrollAndZoomIntoView([target]);
            addLayerStyle(node);
        }
    }
    else {
        figma.notify("No nodes selected");
    }
}
function postMessage() {
    var styles = getLayerStyles();
    var message = styles;
    figma.ui.postMessage(message);
}
function applyStyle(selection, styleId) {
    // TODO: If node already has styleId and it matches it's node.id this means it is the master node for another style. Not sure how to fix this, as other style will look to this node for it. Possible fix is to change style ID of node.
    for (let i = 0; i < selection.length; i++) {
        var node = selection[i];
        node.setPluginData("styleId", styleId);
        addInstance(styleId, node.id);
        // var styleId = node.getPluginData("styleId")
        // Look for node with matching styleID
        var source = figma.getNodeById(styleId);
        if (source) {
            var layerStyle = source;
            copyPaste(layerStyle, node);
        }
        else {
            var layerStyle = getLayerStyles(styleId).node;
            copyPaste(layerStyle, node);
            console.log("Original node can't be found");
        }
    }
}
function removeStyle(styleId) {
    var styles = getLayerStyles();
    styles.splice(styles.findIndex(function (i) {
        return i.id === styleId;
    }), 1);
    figma.root.setPluginData("styles", JSON.stringify(styles));
    // Remove plugin data from all nodes with matching style id
    var pages = figma.root.children;
    var length = pages.length;
    for (let i = 0; i < length; i++) {
        pages[i].findAll(node => {
            if (node.getPluginData("styleId") === styleId) {
                node.setPluginData("styleId", "");
            }
        });
    }
    // TODO: Remove relaunch data
}
var thisNode;
figma.on("selectionchange", () => {
    console.log("Selection changed");
    var node = figma.currentPage.selection[0];
    if (node) {
        if (node.getPluginData("styleId") !== "") {
            console.log("Selection has a layer style");
            if (node.id === node.getPluginData("styleId")) {
                console.log("Selection is master");
                thisNode = node;
            }
        }
    }
    else {
        thisNode = null;
    }
});
// Trying to create a preview for updating layer style in list
function update(thisNode) {
    if (thisNode) {
        var layerStyleId = thisNode.getPluginData("styleId");
        var properties = copyPaste(thisNode);
        updateLayerStyle(layerStyleId, null, properties);
        postMessage();
    }
}
setInterval(() => {
    update(thisNode);
    // This live updates all instances with new style. Performance is a bit sluggish. Might be possible to speed it up if I stored an array of node ids which have layer style applied and then searched for node using getNodeById
    // if (thisNode) {
    // 	updateInstances(null, thisNode.id)
    // }
    // TODO: Remove plugin data from all nodes with matching style id
}, 600);
if (figma.command === "showStyles") {
    // This shows the HTML page in "ui.html".
    figma.showUI(__html__, { width: 240, height: 360 });
    postMessage();
    // Calls to "parent.postMessage" from within the HTML page will trigger this
    // callback. The callback will be passed the "pluginMessage" property of the
    // posted message.
    figma.ui.onmessage = msg => {
        // One way of distinguishing between different types of messages sent from
        // your HTML page is to use an object with a "type" property like this.
        if (msg.type === 'create-shapes') {
            const nodes = [];
            for (let i = 0; i < msg.count; i++) {
                var shape;
                if (msg.shape === 'rectangle') {
                    shape = figma.createRectangle();
                }
                else if (msg.shape === 'triangle') {
                    shape = figma.createPolygon();
                }
                else {
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
        if (msg.type === "add-style") {
            createStyles(figma.currentPage.selection);
            postMessage();
        }
        if (msg.type === "rename-style") {
            updateLayerStyle(msg.id, msg.name);
            postMessage();
        }
        if (msg.type === "update-instances") {
            updateInstances(figma.currentPage.selection, msg.id);
            postMessage();
        }
        if (msg.type === "update-style") {
            var node = figma.currentPage.selection[0];
            var properties = copyPaste(node);
            updateLayerStyle(msg.id, null, properties, node.id);
            figma.currentPage.selection[0].setPluginData("styleId", node.id);
            postMessage();
        }
        if (msg.type === "edit-layer-style") {
            var node = figma.getNodeById(msg.id);
            if (node) {
                figma.viewport.scrollAndZoomIntoView([node]);
                figma.viewport.zoom = 0.25;
                figma.currentPage = pageNode(node);
                figma.currentPage.selection = [node];
            }
            else {
                node = figma.createFrame();
                var properties = getLayerStyles(msg.id).node;
                copyPaste(properties, node);
                centerInViewport(node);
                figma.viewport.scrollAndZoomIntoView([node]);
                figma.viewport.zoom = 0.25;
                // figma.viewport.scrollAndZoomIntoView([node])
                // Set as the new master layer style
                node.setPluginData("styleId", node.id);
                // TODO: Needs to update layer style with new style ID and I think update all connected frames with new style id
                updateLayerStyle(msg.id, null, null, node.id);
                figma.currentPage.selection = [node];
            }
            postMessage();
        }
        if (msg.type === "apply-style") {
            applyStyle(figma.currentPage.selection, msg.id);
        }
        if (msg.type === "remove-style") {
            removeStyle(msg.id);
            postMessage();
        }
        // Make sure to close the plugin when you're done. Otherwise the plugin will
        // keep running, which shows the cancel button at the bottom of the screen.
    };
}
if (figma.command === "createStyles") {
    createStyles(figma.currentPage.selection);
    figma.closePlugin();
}
if (figma.command === "updateStyles") {
    updateInstances(figma.currentPage.selection);
    figma.closePlugin();
}
if (figma.command === "clearStyles") {
    clearLayerStyle();
}
if (figma.command === "copyProperties") {
    copyPaste(figma.currentPage.selection[0]);
    // figma.closePlugin()
}

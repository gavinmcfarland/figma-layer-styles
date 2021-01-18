'use strict';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var base64Arraybuffer = createCommonjsModule(function (module, exports) {
/*
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */
(function(){

  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  // Use a lookup table to find the index.
  var lookup = new Uint8Array(256);
  for (var i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  exports.encode = function(arraybuffer) {
    var bytes = new Uint8Array(arraybuffer),
    i, len = bytes.length, base64 = "";

    for (i = 0; i < len; i+=3) {
      base64 += chars[bytes[i] >> 2];
      base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
      base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
      base64 += chars[bytes[i + 2] & 63];
    }

    if ((len % 3) === 2) {
      base64 = base64.substring(0, base64.length - 1) + "=";
    } else if (len % 3 === 1) {
      base64 = base64.substring(0, base64.length - 2) + "==";
    }

    return base64;
  };

  exports.decode =  function(base64) {
    var bufferLength = base64.length * 0.75,
    len = base64.length, i, p = 0,
    encoded1, encoded2, encoded3, encoded4;

    if (base64[base64.length - 1] === "=") {
      bufferLength--;
      if (base64[base64.length - 2] === "=") {
        bufferLength--;
      }
    }

    var arraybuffer = new ArrayBuffer(bufferLength),
    bytes = new Uint8Array(arraybuffer);

    for (i = 0; i < len; i+=4) {
      encoded1 = lookup[base64.charCodeAt(i)];
      encoded2 = lookup[base64.charCodeAt(i+1)];
      encoded3 = lookup[base64.charCodeAt(i+2)];
      encoded4 = lookup[base64.charCodeAt(i+3)];

      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arraybuffer;
  };
})();
});
var base64Arraybuffer_1 = base64Arraybuffer.encode;
var base64Arraybuffer_2 = base64Arraybuffer.decode;

const nodeProps = [
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
];
const readonly = [
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
];
const instanceProps = [
    'rotation',
    'constrainProportions'
];
const defaults = [
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
];
function clone(val) {
    return JSON.parse(JSON.stringify(val));
}
function copyPasteProps(source, target, { include, exclude } = {}) {
    let allowlist = nodeProps.filter(function (el) {
        return !defaults.concat(readonly).includes(el);
    });
    if (include) {
        allowlist = allowlist.concat(include);
    }
    if (exclude) {
        allowlist = allowlist.filter(function (el) {
            return !exclude.includes(el);
        });
    }
    if ((target === null || target === void 0 ? void 0 : target.parent.type) === "INSTANCE") {
        allowlist = allowlist.filter(function (el) {
            return !instanceProps.includes(el);
        });
    }
    const val = source;
    const type = typeof source;
    if (type === 'undefined' ||
        type === 'number' ||
        type === 'string' ||
        type === 'boolean' ||
        type === 'symbol' ||
        source === null) {
        return val;
    }
    else if (type === 'object') {
        if (val instanceof Array) {
            var newArray = [];
            for (const key1 in source) {
                newArray.push(clone(source[key1]));
            }
            return newArray;
            // return val.map(copyPasteProps)
        }
        else if (val instanceof Uint8Array) {
            return new Uint8Array(val);
        }
        else {
            const o = {};
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
                                o[key1] = copyPasteProps(val[key1], target);
                                // 	}
                                // }
                            }
                        }
                    }
                }
                else {
                    o[key1] = copyPasteProps(val[key1]);
                }
            }
            if (target) {
                !o.fillStyleId && o.fills ? null : delete o.fills;
                !o.strokeStyleId && o.strokes ? null : delete o.strokes;
                !o.backgroundStyleId && o.backgrounds ? null : delete o.backgrounds;
                if (o.cornerRadius !== figma.mixed) {
                    delete o.topLeftRadius;
                    delete o.topRightRadius;
                    delete o.bottomLeftRadius;
                    delete o.bottomRightRadius;
                }
                else {
                    delete o.cornerRadius;
                }
                return Object.assign(target, o);
            }
            else {
                return o;
            }
        }
    }
    throw 'unknown';
}
function nodeRemovedByUser(node) {
    if (node) {
        if (node.parent === null || node.parent.parent === null) {
            return true;
        }
        else {
            return false;
        }
    }
    else {
        return true;
    }
}
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
function sortNodesByPosition(nodes) {
    var result = nodes.map((x) => x);
    result.sort((current, next) => current.x - next.x);
    return result.sort((current, next) => current.y - next.y);
}

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
    'gridStyleId'
    // 'clipsContent',
    // 'guides'
];
function copyPasteStyle(source, target) {
    return copyPasteProps(source, target, {
        include: styleProps, exclude: ['autoRename', 'characters', 'fontName', 'fontSize', 'rotation', 'primaryAxisSizingMode',
            'counterAxisSizingMode',
            'primaryAxisAlignItems',
            'counterAxisAlignItems',
            'constrainProportions',
            'layoutAlign',
            'layoutGrow',
            'layoutMode']
    });
}
function getInstances(styleId) {
    return figma.root.findAll((node) => node.getPluginData("styleId") === styleId);
}
// TODO: Need to add a limit, incase user tries to add too many layer styles at once
function addLayerStyle(node) {
    return __awaiter(this, void 0, void 0, function* () {
        var layerStyles = getLayerStyles();
        for (let i = 0; i < layerStyles.length; i++) {
            var layerStyle = layerStyles[i];
            if (layerStyle.id === node.id) {
                console.log("Layer style already exists");
                figma.notify("Layer style already exists");
                return;
            }
        }
        // Get background image
        var imageBytes;
        var base64;
        if (node.fills[0].type === "IMAGE") {
            const image = figma.getImageByHash(node.fills[0].imageHash);
            imageBytes = yield image.getBytesAsync();
            base64 = `data:image/jpg;base64,${base64Arraybuffer_1(imageBytes)}`;
        }
        var layerStyle = { id: node.id, node: copyPasteStyle(node), name: node.name, base64, arrayBuffer: imageBytes };
        layerStyles.push(layerStyle);
        console.log(layerStyles);
        figma.root.setPluginData("styles", JSON.stringify(layerStyles));
    });
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
            updateLayerStyle(styleId, null, copyPasteStyle(layerStyle));
            copyPasteStyle(layerStyle, node);
        }
        else {
            var layerStyle = getLayerStyles(styleId).node;
            copyPasteStyle(layerStyle, node);
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
    return __awaiter(this, void 0, void 0, function* () {
        if (selection.length > 0) {
            selection = sortNodesByPosition(selection);
            for (var i = 0; i < selection.length; i++) {
                var node = selection[i];
                node.setPluginData("styleId", node.id);
                // var target = pasteProperties(figma.createFrame(), styles)
                // node.setRelaunchData({ updateStyles: 'Refresh layers connected to this style' });
                // figma.viewport.scrollAndZoomIntoView([target]);
                addLayerStyle(node);
            }
        }
        else {
            figma.notify("No layers selected");
        }
    });
}
function applyLayerStyle(selection, styleId) {
    // TODO: If node already has styleId and it matches it's node.id this means it is the master node for another style. Not sure how to fix this, as other style will look to this node for it. Possible fix is to change style ID of node.
    for (let i = 0; i < selection.length; i++) {
        var node = selection[i];
        node.setPluginData("styleId", styleId);
        node.setRelaunchData({ detachLayerStyle: 'Removes association with layer style' });
        // var styleId = node.getPluginData("styleId")
        // Look for node with matching styleID
        var source = figma.getNodeById(styleId);
        if (source) {
            var layerStyle = source;
            copyPasteStyle(layerStyle, node);
        }
        else {
            var layerStyle = getLayerStyles(styleId).node;
            copyPasteStyle(layerStyle, node);
            console.log("Original node can't be found");
        }
    }
    if (selection.length > 0) {
        figma.notify("Layer style applied");
    }
    else {
        figma.notify("Please select a layer");
    }
}
function removeLayerStyle(styleId) {
    var styles = getLayerStyles();
    // Remove layer style with matching node
    styles.splice(styles.findIndex(node => {
        return node.id === styleId;
    }), 1);
    // Set layer styles again
    figma.root.setPluginData("styles", JSON.stringify(styles));
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
            node.setPluginData("styleId", "");
        }
    });
    // TODO: Remove relaunch data
}
function detachLayerStyle(node) {
    node.setPluginData("styleId", "");
    node.setRelaunchData({});
}
function postMessage() {
    var styles = getLayerStyles();
    var message = styles;
    // console.log(styles)
    figma.ui.postMessage(message);
}
// This updates preview inside layer styles list
// TODO: Need to be careful if something happens to node while it's being watched, for example if it's deleted
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
function update(thisNode) {
    if (thisNode) {
        var layerStyleId = thisNode.getPluginData("styleId");
        var properties = copyPasteStyle(thisNode);
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
            var properties = copyPasteStyle(node);
            updateLayerStyle(msg.id, null, properties, node.id);
            figma.currentPage.selection[0].setPluginData("styleId", node.id);
            postMessage();
        }
        if (msg.type === "edit-layer-style") {
            var node = figma.getNodeById(msg.id);
            if (!nodeRemovedByUser(node)) {
                figma.viewport.scrollAndZoomIntoView([node]);
                figma.viewport.zoom = 0.25;
                figma.currentPage = pageNode(node);
                figma.currentPage.selection = [node];
            }
            else {
                node = figma.createFrame();
                var newStyleId = node.id;
                var properties = getLayerStyles(msg.id);
                copyPasteStyle(properties.node, node);
                centerInViewport(node);
                node.name = `${properties.name}`;
                figma.viewport.scrollAndZoomIntoView([node]);
                figma.viewport.zoom = 0.25;
                // figma.viewport.scrollAndZoomIntoView([node])
                // Set as the new master layer style
                node.setPluginData("styleId", node.id);
                updateLayerStyle(msg.id, null, null, node.id);
                // Update instances with new style id
                var instances = getInstances(msg.id);
                instances.map((node) => {
                    node.setPluginData("styleId", newStyleId);
                });
                figma.currentPage.selection = [node];
            }
            postMessage();
        }
        if (msg.type === "apply-style") {
            applyLayerStyle(figma.currentPage.selection, msg.id);
        }
        if (msg.type === "remove-style") {
            removeLayerStyle(msg.id);
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
    copyPasteStyle(figma.currentPage.selection[0]);
    // figma.closePlugin()
}
if (figma.command === "detachLayerStyle") {
    for (var i = 0; i < figma.currentPage.selection.length; i++) {
        var node = figma.currentPage.selection[i];
        detachLayerStyle(node);
    }
    figma.notify("Layer style detached");
    figma.closePlugin();
}

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
function getPageNode(node) {
    if (node.parent.type === "PAGE") {
        return node.parent;
    }
    else {
        return getPageNode(node.parent);
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

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var dist = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * Helpers which make it easier to update client storage
 */
async function getClientStorageAsync(key) {
    return await figma.clientStorage.getAsync(key);
}
function setClientStorageAsync(key, data) {
    return figma.clientStorage.setAsync(key, data);
}
async function updateClientStorageAsync(key, callback) {
    var data = await figma.clientStorage.getAsync(key);
    data = callback(data);
    await figma.clientStorage.setAsync(key, data);
    // What should happen if user doesn't return anything in callback?
    if (!data) {
        data = null;
    }
    // node.setPluginData(key, JSON.stringify(data))
    return data;
}

const eventListeners = [];
/**
 * Send an event to the UI
 * @param {string} action Name of the event
 * @param {any} data Data to send to the UI
 */
const dispatchEvent = (action, data) => {
    figma.ui.postMessage({ action, data });
};
/**
 * Handle an event from the UI
 * @param {string} action Name of the event
 * @param {Function} callback Function to run on event
 */
const handleEvent = (action, callback) => {
    eventListeners.push({ action, callback });
};
figma.ui.onmessage = message => {
    for (let eventListener of eventListeners) {
        if (message.action === eventListener.action)
            eventListener.callback(message.data);
    }
};

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
    'guides',
    'type'
];
const readOnly = [
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
    'type',
    'masterComponent',
    'mainComponent'
];
// export function copyPaste(source: {} | BaseNode, target: {} | BaseNode)
// export function copyPaste(source: {} | BaseNode, target: {} | BaseNode, options: Options)
// export function copyPaste(source: {} | BaseNode, target: {} | BaseNode, callback: Callback)
// export function copyPaste(source: {} | BaseNode, target: {} | BaseNode, options: Options, callback: Callback)
// export function copyPaste(source: {} | BaseNode, target: {} | BaseNode, callback: Callback, options: Options)
/**
* Allows you to copy and paste props between nodes.
*
* @param source - The node you want to copy from
* @param target - The node or object you want to paste to
* @param args - Either options or a callback.
* @returns A node or object with the properties copied over
*/
function copyPaste(source, target, ...args) {
    var targetIsEmpty;
    if (target && Object.keys(target).length === 0 && target.constructor === Object) {
        targetIsEmpty = true;
    }
    var options;
    if (typeof args[0] === 'function')
        ;
    if (typeof args[1] === 'function')
        ;
    if (typeof args[0] === 'object' && typeof args[0] !== 'function')
        options = args[0];
    if (typeof args[0] === 'object' && typeof args[0] !== 'function')
        options = args[0];
    if (!options)
        options = {};
    const { include, exclude, withoutRelations, removeConflicts } = options;
    // const props = Object.entries(Object.getOwnPropertyDescriptors(source.__proto__))
    let allowlist = nodeProps.filter(function (el) {
        return !readOnly.includes(el);
    });
    if (include) {
        // If include supplied, include copy across these properties and their values if they exist
        allowlist = include.filter(function (el) {
            return !readOnly.includes(el);
        });
    }
    if (exclude) {
        // If exclude supplied then don't copy over the values of these properties
        allowlist = allowlist.filter(function (el) {
            return !exclude.concat(readOnly).includes(el);
        });
    }
    // target supplied, don't copy over the values of these properties
    if (target && !targetIsEmpty) {
        allowlist = allowlist.filter(function (el) {
            return !['id', 'type'].includes(el);
        });
    }
    var obj = {};
    if (targetIsEmpty) {
        if (obj.id === undefined) {
            obj.id = source.id;
        }
        if (obj.type === undefined) {
            obj.type = source.type;
        }
        if (source.key)
            obj.key = source.key;
    }
    const props = Object.entries(Object.getOwnPropertyDescriptors(source.__proto__));
    for (const [key, value] of props) {
        if (allowlist.includes(key)) {
            try {
                if (typeof obj[key] === 'symbol') {
                    obj[key] = 'Mixed';
                }
                else {
                    obj[key] = value.get.call(source);
                }
            }
            catch (err) {
                obj[key] = undefined;
            }
        }
        // Needs building in
        // if (callback) {
        //     callback(obj)
        // }
        // else {
        // }
    }
    if (!removeConflicts) {
        !obj.fillStyleId && obj.fills ? delete obj.fillStyleId : delete obj.fills;
        !obj.strokeStyleId && obj.strokes ? delete obj.strokeStyleId : delete obj.strokes;
        !obj.backgroundStyleId && obj.backgrounds ? delete obj.backgroundStyleId : delete obj.backgrounds;
        !obj.effectStyleId && obj.effects ? delete obj.effectStyleId : delete obj.effects;
        !obj.gridStyleId && obj.layoutGrids ? delete obj.gridStyleId : delete obj.layoutGrids;
        if (obj.textStyleId) {
            delete obj.fontName;
            delete obj.fontSize;
            delete obj.letterSpacing;
            delete obj.lineHeight;
            delete obj.paragraphIndent;
            delete obj.paragraphSpacing;
            delete obj.textCase;
            delete obj.textDecoration;
        }
        else {
            delete obj.textStyleId;
        }
        if (obj.cornerRadius !== figma.mixed) {
            delete obj.topLeftRadius;
            delete obj.topRightRadius;
            delete obj.bottomLeftRadius;
            delete obj.bottomRightRadius;
        }
        else {
            delete obj.cornerRadius;
        }
    }
    // Only applicable to objects because these properties cannot be set on nodes
    if (targetIsEmpty) {
        if (source.parent && !withoutRelations) {
            obj.parent = { id: source.parent.id, type: source.parent.type };
        }
    }
    // Only applicable to objects because these properties cannot be set on nodes
    if (targetIsEmpty) {
        if (source.type === "FRAME" || source.type === "COMPONENT" || source.type === "COMPONENT_SET" || source.type === "PAGE" || source.type === 'GROUP' || source.type === 'INSTANCE' || source.type === 'DOCUMENT' || source.type === 'BOOLEAN_OPERATION') {
            if (source.children && !withoutRelations) {
                obj.children = source.children.map((child) => copyPaste(child, {}, { withoutRelations }));
            }
        }
        if (source.type === "INSTANCE") {
            if (source.mainComponent && !withoutRelations) {
                obj.masterComponent = copyPaste(source.mainComponent, {}, { withoutRelations });
            }
        }
    }
    Object.assign(target, obj);
    return obj;
}

// TODO: Change so that it can convert any node to any type?
/**
 * Convert a node to a component
 */
// FIXME: Typescript says detachInstance() doesn't exist on SceneNode & ChildrenMixin 
function convertToComponent(node) {
    const component = figma.createComponent();
    if (node.type === "INSTANCE") {
        node = node.detachInstance();
    }
    component.resizeWithoutConstraints(node.width, node.height);
    for (const child of node.children) {
        component.appendChild(child);
    }
    copyPaste(node, component);
    node.remove();
    return component;
}

/**
 * Helpers which automatically parse and stringify when you get, set or update plugin data
 */
/**
 *
 * @param {BaseNode} node A figma node to get data from
 * @param {string} key  The key under which data is stored
 * @returns Plugin Data
 */
function getPluginData(node, key) {
    return JSON.parse(node.getPluginData(key));
}
/**
 *
 * @param {BaseNode} node  A figma node to set data on
 * @param {String} key A key to store data under
 * @param {any} data Data to be stoed
 */
function setPluginData(node, key, data) {
    node.setPluginData(key, JSON.stringify(data));
}
function updatePluginData(node, key, callback) {
    var data;
    if (node.getPluginData(key)) {
        data = JSON.parse(node.getPluginData(key));
    }
    else {
        data = null;
    }
    data = callback(data);
    // What should happen if user doesn't return anything in callback?
    if (!data) {
        data = null;
    }
    node.setPluginData(key, JSON.stringify(data));
    return data;
}

/**
 * Convinient way to delete children of a node
 * @param {SceneNode & ChildrenMixin } node A node with children
 */
function removeChildren(node) {
    var length = node.children.length;
    if (length > 0) {
        for (let i = 0; i < length; i++) {
            node.children[0].remove();
        }
    }
}

/**
 * Resizes a node, to allow nodes of size < 0.01
 * A value of zero will be replaced with 1/Number.MAX_SAFE_INTEGER
 * @param {SceneNode & LayoutMixin} node Node to resize
 * @param {number} width
 * @param {number} height
 * @returns Resized Node
 */
function resize(node, width, height) {
    //Workaround to resize a node, if its size is less than 0.01
    //If 0, make it almost zero
    width === 0 ? width = 1 / Number.MAX_SAFE_INTEGER : null;
    height === 0 ? height = 1 / Number.MAX_SAFE_INTEGER : null;
    let nodeParent = node.parent;
    node.resize(width < 0.01 ? 1 : width, height < 0.01 ? 1 : height);
    if (width < 0.01 || height < 0.01) {
        let dummy = figma.createRectangle();
        dummy.resize(width < 0.01 ? 1 / width : width, height < 0.01 ? 1 / height : height);
        let group = figma.group([node, dummy], figma.currentPage);
        group.resize(width < 0.01 ? 1 : width, height < 0.01 ? 1 : height);
        nodeParent.appendChild(node);
        group.remove();
    }
    return node;
}

/**
 * Mimics similar behaviour to ungrouping nodes in editor.
 * @param {SceneNode & ChildrenMixin } node A node with children
 * @param parent Target container to append ungrouped nodes to
 * @returns Selection of node's children
 */
function ungroup(node, parent) {
    let selection = [];
    let children = node.children;
    for (let i = 0; i < children.length; i++) {
        parent.appendChild(children[i]);
        selection.push(children[i]);
    }
    // Doesn't need removing if it's a group node
    if (node.type !== "GROUP") {
        node.remove();
    }
    return selection;
}

/**
 * Returns true if the node is nested inside an instance. It does not include the instance itself.
 * @param {SceneNode} node A node you want to check
 * @returns Returns true if inside an instance
 */
function isInsideInstance(node) {
    const parent = node.parent;
    // Sometimes parent is null
    if (parent) {
        if (parent && parent.type === 'INSTANCE') {
            return true;
        }
        else if (parent && parent.type === 'PAGE') {
            return false;
        }
        else {
            return isInsideInstance(parent);
        }
    }
    else {
        return false;
    }
}

/**
 * Returns the closet parent instance
 * @param {SceneNode} node An specific node you want to get the parent instance for
 * @returns Returns the parent instance node
 */
function getParentInstance(node) {
    const parent = node.parent;
    if (node.type === "PAGE")
        return false;
    if (parent.type === "INSTANCE") {
        return parent;
    }
    else {
        return getParentInstance(parent);
    }
}

/**
 * Returns the index of a node
 * @param {SceneNode} node A node
 * @returns The index of the node
 */
function getNodeIndex(node) {
    return node.parent.children.indexOf(node);
}

/**
 * Returns the location of the node
 * @param {SceneNode} node A node you want the location of
 * @param {SceneNode} container The container you would like to compare the node's location with
 * @returns An array of node indexes. The first item is the container node
 */
function getNodeLocation(node, container = figma.currentPage, location = []) {
    if (node && container) {
        if (node.id === container.id) {
            if (location.length > 0) {
                location.push(container);
                // Because nodesIndex have been captured in reverse
                return location.reverse();
            }
            else {
                return false;
            }
        }
        else {
            if (node.parent) {
                var nodeIndex = getNodeIndex(node);
                // if (node.parent.layoutMode == "HORIZONTAL" || node.parent.layoutMode === "VERTICAL") {
                // 	nodeIndex = (node.parent.children.length - 1) - getNodeIndex(node)
                // }
                location.push(nodeIndex);
                return getNodeLocation(node.parent, container, location);
            }
        }
    }
    else {
        console.error("Node or container not defined");
        return false;
    }
    return false;
}

/**
 * Provides the counterpart component node to the selected instance node. Rather than use the instance node id, it stores the location of the node and then looks for the same node in the main component.
 * @param {SceneNode & ChildrenMixin } node A node with children
 * @returns Returns the counterpart component node
 */
function getInstanceCounterpartUsingLocation(node, parentInstance = getParentInstance(node), location = getNodeLocation(node, parentInstance), parentComponentNode = parentInstance === null || parentInstance === void 0 ? void 0 : parentInstance.mainComponent) {
    location.shift();
    function loopChildren(node, d = 1) {
        var nodeIndex = location[d];
        if (node.children) {
            for (var i = 0; i < node.children.length; i++) {
                var child = node.children[i];
                if (getNodeIndex(child) === nodeIndex) {
                    if (location.length - 1 === d) {
                        return child;
                    }
                    else {
                        return loopChildren(child, d + 1);
                    }
                }
            }
        }
        else {
            return node;
        }
    }
    if (parentComponentNode && parentComponentNode.children) {
        for (var i = 0; i < parentComponentNode.children.length; i++) {
            var componentNode = parentComponentNode.children[i];
            var nodeIndex = location[0];
            if (getNodeIndex(componentNode) === nodeIndex) {
                if (location.length - 1 === 0) {
                    return componentNode;
                }
                else {
                    return loopChildren(componentNode);
                }
            }
        }
    }
    else {
        return node.mainComponent;
    }
}

/**
 * Provides the counterpart component node to the selected instance node. It defaults to using the instance node id to find the matching counterpart node. When this can't be found, it uses `getInstanceCounterpartUsingLocation()`.
 * @param {SceneNode & ChildrenMixin } node A node with children
 * @returns Returns the counterpart component node
 */
function getInstanceCounterpart(node) {
    // This splits the ide of the selected node and uses the last part which is the id of the counterpart node. Then it finds this in the document.
    if (isInsideInstance(node)) {
        var child = figma.getNodeById(node.id.split(';').slice(-1)[0]);
        if (child) {
            return child;
        }
        else {
            // console.log(node.name)
            // figma.closePlugin("Does not work with remote components")
            // If can't find node in document (because remote library)
            getParentInstance(node);
            // var mainComponent = parentInstance.mainComponent
            return getInstanceCounterpartUsingLocation(node);
        }
    }
}

/**
 * Returns the depth of a node relative to its container
 * @param {SceneNode} node A node
 * @returns An integer which represents the depth
 */
function getNodeDepth(node, container = figma.currentPage, depth = 0) {
    if (node) {
        if (node.id === container.id) {
            return depth;
        }
        else {
            depth += 1;
            return getNodeDepth(node.parent, container, depth);
        }
    }
}

/**
 * Returns the closest parent which isn't a group
 * @param {SceneNode} node A node
 * @returns Returns a node
 */
function getNoneGroupParent(node) {
    var _a, _b, _c;
    if (((_a = node.parent) === null || _a === void 0 ? void 0 : _a.type) === "BOOLEAN_OPERATION"
        || ((_b = node.parent) === null || _b === void 0 ? void 0 : _b.type) === "COMPONENT_SET"
        || ((_c = node.parent) === null || _c === void 0 ? void 0 : _c.type) === "GROUP") {
        return getNoneGroupParent(node.parent);
    }
    else {
        return node.parent;
    }
}

const nodeToObject = (node, withoutRelations, removeConflicts) => {
    const props = Object.entries(Object.getOwnPropertyDescriptors(node.__proto__));
    const blacklist = ['parent', 'children', 'removed', 'masterComponent'];
    const obj = { id: node.id, type: node.type };
    for (const [name, prop] of props) {
        if (prop.get && !blacklist.includes(name)) {
            try {
                if (typeof obj[name] === 'symbol') {
                    obj[name] = 'Mixed';
                }
                else {
                    obj[name] = prop.get.call(node);
                }
            }
            catch (err) {
                obj[name] = undefined;
            }
        }
    }
    if (node.parent && !withoutRelations) {
        obj.parent = { id: node.parent.id, type: node.parent.type };
    }
    if (node.children && !withoutRelations) {
        obj.children = node.children.map((child) => nodeToObject(child, withoutRelations));
    }
    if (node.masterComponent && !withoutRelations) {
        obj.masterComponent = nodeToObject(node.masterComponent, withoutRelations);
    }
    if (!removeConflicts) {
        !obj.fillStyleId && obj.fills ? delete obj.fillStyleId : delete obj.fills;
        !obj.strokeStyleId && obj.strokes ? delete obj.strokeStyleId : delete obj.strokes;
        !obj.backgroundStyleId && obj.backgrounds ? delete obj.backgroundStyleId : delete obj.backgrounds;
        !obj.effectStyleId && obj.effects ? delete obj.effectStyleId : delete obj.effects;
        !obj.gridStyleId && obj.layoutGrids ? delete obj.gridStyleId : delete obj.layoutGrids;
        if (obj.textStyleId) {
            delete obj.fontName;
            delete obj.fontSize;
            delete obj.letterSpacing;
            delete obj.lineHeight;
            delete obj.paragraphIndent;
            delete obj.paragraphSpacing;
            delete obj.textCase;
            delete obj.textDecoration;
        }
        else {
            delete obj.textStyleId;
        }
        if (obj.cornerRadius !== figma.mixed) {
            delete obj.topLeftRadius;
            delete obj.topRightRadius;
            delete obj.bottomLeftRadius;
            delete obj.bottomRightRadius;
        }
        else {
            delete obj.cornerRadius;
        }
    }
    return obj;
};

/**
 * Returns the overrides for a specific node inside an instance
 * @param {SceneNode} node A specific node you want overrides for
 * @param {SceneNode} prop A specific prop you want to get overrides for
 * @returns Returns an object of properties. If you provide a prop it will provide a value.
 */
function getOverrides(node, prop) {
    if (isInsideInstance(node)) {
        var componentNode = getInstanceCounterpart(node);
        var properties = nodeToObject(node);
        var overriddenProps = {};
        if (prop) {
            if (prop !== "key"
                && prop !== "mainComponent"
                && prop !== "absoluteTransform"
                && prop !== "type"
                && prop !== "id"
                && prop !== "parent"
                && prop !== "children"
                && prop !== "masterComponent"
                && prop !== "mainComponent"
                && prop !== "horizontalPadding"
                && prop !== "verticalPadding"
                && prop !== "reactions"
                && prop !== "overlayPositionType"
                && prop !== "overflowDirection"
                && prop !== "numberOfFixedChildren"
                && prop !== "overlayBackground"
                && prop !== "overlayBackgroundInteraction"
                && prop !== "remote"
                && prop !== "defaultVariant"
                && prop !== "hasMissingFont"
                && prop !== "exportSettings") {
                if (JSON.stringify(node[prop]) !== JSON.stringify(componentNode[prop])) {
                    return node[prop];
                }
            }
        }
        else {
            for (let [key, value] of Object.entries(properties)) {
                if (key !== "key"
                    && key !== "mainComponent"
                    && key !== "absoluteTransform"
                    && key !== "type"
                    && key !== "id"
                    && key !== "parent"
                    && key !== "children"
                    && key !== "masterComponent"
                    && key !== "mainComponent"
                    && key !== "horizontalPadding"
                    && key !== "verticalPadding"
                    && key !== "reactions"
                    && key !== "overlayPositionType"
                    && key !== "overflowDirection"
                    && key !== "numberOfFixedChildren"
                    && key !== "overlayBackground"
                    && key !== "overlayBackgroundInteraction"
                    && key !== "remote"
                    && key !== "defaultVariant"
                    && key !== "hasMissingFont"
                    && key !== "exportSettings") {
                    if (JSON.stringify(properties[key]) !== JSON.stringify(componentNode[key])) {
                        overriddenProps[key] = value;
                    }
                }
            }
            if (JSON.stringify(overriddenProps) === "{}") {
                return false;
            }
            else {
                return overriddenProps;
            }
        }
    }
}

/**
 * Returns the top most instance that a node belongs to
 * @param {SceneNode} node A node
 * @returns The top most instance node
 */
function getTopInstance(node) {
    if (node.type === "PAGE")
        return null;
    if (isInsideInstance(node)) {
        return getTopInstance(node.parent);
    }
    else {
        return node;
    }
}

exports.convertToComponent = convertToComponent;
exports.copyPaste = copyPaste;
exports.dispatchEvent = dispatchEvent;
exports.getClientStorageAsync = getClientStorageAsync;
exports.getInstanceCounterpart = getInstanceCounterpart;
exports.getInstanceCounterpartUsingLocation = getInstanceCounterpartUsingLocation;
exports.getNodeDepth = getNodeDepth;
exports.getNodeIndex = getNodeIndex;
exports.getNodeLocation = getNodeLocation;
exports.getNoneGroupParent = getNoneGroupParent;
exports.getOverrides = getOverrides;
exports.getParentInstance = getParentInstance;
exports.getPluginData = getPluginData;
exports.getTopInstance = getTopInstance;
exports.handleEvent = handleEvent;
exports.isInsideInstance = isInsideInstance;
exports.nodeToObject = nodeToObject;
exports.removeChildren = removeChildren;
exports.resize = resize;
exports.setClientStorageAsync = setClientStorageAsync;
exports.setPluginData = setPluginData;
exports.ungroup = ungroup;
exports.updateClientStorageAsync = updateClientStorageAsync;
exports.updatePluginData = updatePluginData;
});

unwrapExports(dist);
var dist_1 = dist.convertToComponent;
var dist_2 = dist.copyPaste;
var dist_3 = dist.dispatchEvent;
var dist_4 = dist.getClientStorageAsync;
var dist_5 = dist.getInstanceCounterpart;
var dist_6 = dist.getInstanceCounterpartUsingLocation;
var dist_7 = dist.getNodeDepth;
var dist_8 = dist.getNodeIndex;
var dist_9 = dist.getNodeLocation;
var dist_10 = dist.getNoneGroupParent;
var dist_11 = dist.getOverrides;
var dist_12 = dist.getParentInstance;
var dist_13 = dist.getPluginData;
var dist_14 = dist.getTopInstance;
var dist_15 = dist.handleEvent;
var dist_16 = dist.isInsideInstance;
var dist_17 = dist.nodeToObject;
var dist_18 = dist.removeChildren;
var dist_19 = dist.resize;
var dist_20 = dist.setClientStorageAsync;
var dist_21 = dist.setPluginData;
var dist_22 = dist.ungroup;
var dist_23 = dist.updateClientStorageAsync;
var dist_24 = dist.updatePluginData;

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
    if (target) {
        return dist_2(source, target, {
            include: styleProps,
            exclude: ['autoRename', 'characters', 'fontName', 'fontSize', 'rotation', 'primaryAxisSizingMode',
                'counterAxisSizingMode',
                'primaryAxisAlignItems',
                'counterAxisAlignItems',
                'constrainProportions',
                'layoutAlign',
                'layoutGrow',
                'layoutMode']
        });
    }
    else {
        return dist_2(source, {});
    }
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
        var newLayerStyle = { id: node.id, node: copyPasteStyle(node), name: node.name };
        layerStyles.push(newLayerStyle);
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
        // var instances = getInstances(nodeBeingEdited.getPluginData("styleId"))
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
        var layerStyle;
        if (source) {
            layerStyle = source;
            updateLayerStyle(styleId, null, copyPasteStyle(layerStyle));
            copyPasteStyle(layerStyle, node);
        }
        else {
            layerStyle = getLayerStyles(styleId).node;
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
            if (selection.length <= 20) {
                selection = sortNodesByPosition(selection);
                for (var i = 0; i < selection.length; i++) {
                    var node = selection[i];
                    node.setPluginData("styleId", node.id);
                    // var target = pasteProperties(figma.createFrame(), styles)
                    // node.setRelaunchData({ updateStyles: 'Refresh layers connected to this style' });
                    // figma.viewport.scrollAndZoomIntoView([target]);
                    // console.log(node)
                    addLayerStyle(node);
                }
            }
            else {
                figma.notify("Limited to 20 layer styles at a time");
            }
        }
        else {
            figma.notify("No layers selected");
        }
    });
}
function applyLayerStyle(selection, styleId) {
    // TODO: If node already has styleId and it matches it's node.id this means it is the master node for another style. Not sure how to fix this, as other style will look to this node for it. Possible fix is to change style ID of node.
    var layerStyle;
    layerStyle = getLayerStyles(styleId).node;
    var source = figma.getNodeById(styleId);
    if (selection.length <= 100) {
        if (selection.length > 0) {
            for (let i = 0; i < selection.length; i++) {
                var node = selection[i];
                node.setPluginData("styleId", styleId);
                node.setRelaunchData({ detachLayerStyle: 'Removes association with layer style' });
                // var styleId = node.getPluginData("styleId")
                // Look for node with matching styleID
                if (source) {
                    layerStyle = source;
                    copyPasteStyle(layerStyle, node);
                }
                else {
                    copyPasteStyle(layerStyle, node);
                    console.log("Original node can't be found");
                }
            }
            figma.notify("Layer style applied");
        }
        else {
            figma.notify("Please select a layer");
        }
    }
    else {
        figma.notify("Limited to 100 layers at a time");
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
    figma.ui.postMessage(styles);
}
// This updates preview inside layer styles list
// TODO: Need to be careful if something happens to node while it's being watched, for example if it's deleted
// The node being edited
var nodeBeingEdited = null;
function checkNodeBeingEdited(selection) {
    if (selection && selection.length === 1) {
        var node = selection[0];
        if (node.id === node.getPluginData("styleId")) {
            console.log("Selection is main layer style");
            nodeBeingEdited = node;
        }
    }
}
function updatePreview(nodeBeingEdited) {
    if (nodeBeingEdited) {
        var layerStyleId = nodeBeingEdited.getPluginData("styleId");
        var properties = copyPasteStyle(nodeBeingEdited);
        updateLayerStyle(layerStyleId, null, properties);
        postMessage();
    }
}
figma.on("selectionchange", () => {
    checkNodeBeingEdited(figma.currentPage.selection);
    console.log("Selection changed");
    if (nodeBeingEdited) {
        setInterval(() => {
            updatePreview(nodeBeingEdited);
        }, 600);
    }
    // If user unselects then change node being edited to null
    if (figma.currentPage.selection.length === 0) {
        nodeBeingEdited = null;
    }
});
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
                figma.currentPage = getPageNode(node);
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
if (figma.command === "clearLayerStyles") {
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

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

// This plugin will open a modal to prompt the user to enter a number, and
// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).
function clone(val) {
    return JSON.parse(JSON.stringify(val));
}
function copyStyles(source) {
    var styles = {};
    styles.name = source.name;
    if (source.fillStyleId == "") {
        styles.fills = source.fills;
    }
    else {
        styles.fillStyleId = source.fillStyleId;
    }
    if (source.strokeStyleId == "") {
        styles.strokes = source.strokes;
    }
    else {
        styles.strokeStyleId = source.strokeStyleId;
    }
    styles.strokeWeight = source.strokeWeight;
    styles.strokeAlign = source.strokeAlign;
    styles.strokeCap = source.strokeCap;
    styles.strokeJoin = source.strokeJoin;
    styles.strokeMiterLimit = source.strokeMiterLimit;
    if (styles.type !== "INSTANCE") {
        styles.topLeftRadius = source.topLeftRadius;
        styles.topRightRadius = source.topRightRadius;
        styles.bottomLeftRadius = source.bottomLeftRadius;
        styles.bottomRightRadius = source.bottomRightRadius;
    }
    styles.dashPattern = source.dashPattern;
    styles.clipsContent = source.clipsContent;
    styles.effects = clone(source.effects);
    // for (let i = 0; i < current.children.length; i++) {
    // 	styles.appendChild(current.children[i].clone())
    // }
    console.log(styles);
    return styles;
}
function setStyle(object) {
    return __awaiter(this, void 0, void 0, function* () {
        var styles = yield figma.clientStorage.getAsync("styles");
        if (styles) {
            console.log("Getting styles");
        }
        else {
            styles = [];
        }
        styles.push(object);
        yield figma.clientStorage.setAsync("styles", styles);
    });
}
function getStyles() {
    return __awaiter(this, void 0, void 0, function* () {
        var styles = yield figma.clientStorage.getAsync("styles");
        return styles;
    });
}
// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 232, height: 208 });
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        var styles = yield getStyles();
        var message = styles;
        figma.ui.postMessage(message);
    });
})();
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
    function pasteStyles(target, styles) {
        Object.assign(target, styles);
        return target;
    }
    if (msg.type === "copy-styles") {
        var styles = copyStyles(figma.currentPage.selection[0]);
        var target = pasteStyles(figma.createFrame(), styles);
        figma.viewport.scrollAndZoomIntoView([target]);
        (function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield setStyle(styles);
                yield getStyles();
            });
        })();
    }
    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
};

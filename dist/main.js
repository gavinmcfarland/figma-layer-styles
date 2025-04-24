var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key2, value) => key2 in obj ? __defProp(obj, key2, { enumerable: true, configurable: true, writable: true, value }) : obj[key2] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
(function() {
  "use strict";
  const runtimeData = {
    "instanceId": "WHsnAaOdH7GZswNXxMvNy",
    "command": "dev"
  };
  function handleDeleteClientStorage(_msg) {
    return __async(this, null, function* () {
      const clientStorageKeys = yield figma.clientStorage.keysAsync();
      for (const key2 of clientStorageKeys) {
        if (key2 !== "figma-stylesheet") {
          yield figma.clientStorage.deleteAsync(key2);
          console.log(`[plugma] ${key2} deleted from clientStorage`);
        }
      }
      figma.notify("ClientStorage deleted");
    });
  }
  handleDeleteClientStorage.EVENT_NAME = "PLUGMA_DELETE_CLIENT_STORAGE";
  function handleDeleteRootPluginData() {
    return __async(this, null, function* () {
      const pluginDataKeys = figma.root.getPluginDataKeys();
      for (const key2 of pluginDataKeys) {
        figma.root.setPluginData(key2, "");
        console.log(`[plugma] ${key2} deleted from root pluginData`);
      }
      figma.notify("Root pluginData deleted");
    });
  }
  handleDeleteRootPluginData.EVENT_NAME = "PLUGMA_DELETE_ROOT_PLUGIN_DATA";
  const figmaApi = {
    resize: figma.ui.resize.bind(figma.ui),
    showUI: figma.showUI.bind(figma),
    reposition: figma.ui.reposition.bind(figma.ui)
  };
  const defaultSettings = {
    width: 300,
    height: 200,
    minimized: false,
    toolbarEnabled: false
  };
  const defaultPreviewSettings = {
    width: 300,
    height: 200,
    minimized: true,
    toolbarEnabled: true
  };
  const DEFAULT_WINDOW_SETTINGS = {
    dev: defaultSettings,
    preview: defaultPreviewSettings,
    build: defaultSettings,
    test: defaultSettings
  };
  const TOOLBAR_HEIGHT$1 = 41;
  function getWindowSettings(options) {
    return __async(this, null, function* () {
      const command = runtimeData.command;
      const storageKeyDev = "PLUGMA_PLUGIN_WINDOW_SETTINGS_DEV";
      let pluginWindowSettings;
      {
        pluginWindowSettings = yield figma.clientStorage.getAsync(storageKeyDev);
        if (!pluginWindowSettings) {
          yield figma.clientStorage.setAsync(storageKeyDev, DEFAULT_WINDOW_SETTINGS.dev);
          pluginWindowSettings = DEFAULT_WINDOW_SETTINGS.dev;
        }
      }
      if (options && (!options.width || !options.height)) {
        pluginWindowSettings.height = 300;
        pluginWindowSettings.width = 400;
        if (pluginWindowSettings.toolbarEnabled) {
          pluginWindowSettings.height += TOOLBAR_HEIGHT$1;
        }
      }
      if (!pluginWindowSettings || typeof pluginWindowSettings !== "object") {
        return DEFAULT_WINDOW_SETTINGS[command];
      }
      if (pluginWindowSettings.position) {
        const { x, y } = pluginWindowSettings.position;
        if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0) {
          pluginWindowSettings.position = { x: 0, y: 0 };
        }
      }
      return __spreadValues(__spreadValues({}, DEFAULT_WINDOW_SETTINGS[command]), pluginWindowSettings);
    });
  }
  const TOOLBAR_HEIGHT = 41;
  function saveWindowSettings(settings) {
    return __async(this, null, function* () {
      const storageKey = "PLUGMA_PLUGIN_WINDOW_SETTINGS_DEV";
      yield figma.clientStorage.setAsync(storageKey, settings);
    });
  }
  function handleSaveWindowSettings(msg) {
    return __async(this, null, function* () {
      getWindowSettings().then((pluginWindowSettings) => {
        if (msg.data.height) {
          if (msg.data.toolbarEnabled) {
            figmaApi.resize(msg.data.width, msg.data.height + TOOLBAR_HEIGHT);
          } else {
            figmaApi.resize(msg.data.width, msg.data.height - TOOLBAR_HEIGHT);
          }
          let mergedOptions = Object.assign(pluginWindowSettings, msg.data);
          saveWindowSettings(mergedOptions);
        }
      });
    });
  }
  handleSaveWindowSettings.EVENT_NAME = "PLUGMA_SAVE_PLUGIN_WINDOW_SETTINGS";
  function handleHideToolbar(_msg) {
    return __async(this, null, function* () {
      if (!figmaApi) throw new Error("Figma API not available");
      const settings = yield getWindowSettings();
      settings.toolbarEnabled = false;
      figmaApi.resize(settings.width, settings.height);
      yield saveWindowSettings(settings);
    });
  }
  handleHideToolbar.EVENT_NAME = "PLUGMA_HIDE_TOOLBAR";
  function handleMaximizeWindow(_msg) {
    return __async(this, null, function* () {
      if (!figmaApi) throw new Error("Figma API not available");
      const settings = yield getWindowSettings();
      settings.minimized = false;
      const height = settings.toolbarEnabled ? settings.height + 41 : settings.height;
      figmaApi.resize(settings.width, height);
      yield saveWindowSettings(settings);
    });
  }
  handleMaximizeWindow.EVENT_NAME = "PLUGMA_MAXIMIZE_WINDOW";
  function handleMinimizeWindow(_msg) {
    return __async(this, null, function* () {
      if (!figmaApi) throw new Error("Figma API not available");
      const settings = yield getWindowSettings();
      settings.minimized = true;
      figmaApi.resize(200, 40);
      yield saveWindowSettings(settings);
    });
  }
  handleMinimizeWindow.EVENT_NAME = "PLUGMA_MINIMIZE_WINDOW";
  function getCommandHistory() {
    return __async(this, null, function* () {
      let commandHistory = yield figma.clientStorage.getAsync("PLUGMA_COMMAND_HISTORY");
      if (!commandHistory) {
        commandHistory = {
          previousCommand: null,
          previousInstanceId: null
        };
      }
      const previousCommand = commandHistory.previousCommand;
      const previousInstanceId = commandHistory.previousInstanceId;
      commandHistory.previousCommand = runtimeData.command;
      commandHistory.previousInstanceId = runtimeData.instanceId;
      yield figma.clientStorage.setAsync("PLUGMA_COMMAND_HISTORY", commandHistory);
      return { previousCommand, previousInstanceId };
    });
  }
  function customShowUI(htmlString, initialOptions) {
    const options = __spreadValues({}, initialOptions);
    const mergedOptions = __spreadValues({ visible: false }, options);
    figmaApi.showUI(htmlString, mergedOptions);
    getCommandHistory().then((commandHistory) => {
      getWindowSettings(DEFAULT_WINDOW_SETTINGS["dev"]).then((pluginWindowSettings) => {
        var _a, _b;
        const hasCommandChanged = commandHistory.previousCommand !== runtimeData.command;
        commandHistory.previousInstanceId !== runtimeData.instanceId;
        if (hasCommandChanged && runtimeData.command === "dev") {
          const zoom = figma.viewport.zoom;
          if (!options.position) {
            options.position = {
              x: figma.viewport.center.x - (options.width || 300) / 2 / zoom,
              y: figma.viewport.center.y - ((options.height || 200) + 41) / 2 / zoom
            };
          }
        }
        if (options.height) {
          pluginWindowSettings.height = options.height;
        }
        if (options.width) {
          pluginWindowSettings.width = options.width;
        }
        if (pluginWindowSettings.toolbarEnabled && options.height) {
          options.height += 41;
        }
        if (pluginWindowSettings.minimized) {
          options.height = 40;
          options.width = 200;
        }
        if (options.width && options.height) {
          figmaApi.resize(options.width, options.height);
        } else if (pluginWindowSettings.toolbarEnabled) {
          figmaApi.resize(300, 241);
        } else {
          figmaApi.resize(300, 200);
        }
        if (((_a = options.position) == null ? void 0 : _a.x) != null && ((_b = options.position) == null ? void 0 : _b.y) != null) {
          figmaApi.reposition(options.position.x, options.position.y);
        }
        figma.ui.postMessage({
          event: "PLUGMA_PLUGIN_WINDOW_SETTINGS",
          data: pluginWindowSettings
        });
        if (options.visible !== false) {
          figma.ui.show();
        }
      });
    });
  }
  const windowHandlers = {
    [handleMinimizeWindow.EVENT_NAME]: handleMinimizeWindow,
    [handleMaximizeWindow.EVENT_NAME]: handleMaximizeWindow,
    [handleHideToolbar.EVENT_NAME]: handleHideToolbar,
    [handleSaveWindowSettings.EVENT_NAME]: handleSaveWindowSettings,
    [handleDeleteRootPluginData.EVENT_NAME]: handleDeleteRootPluginData,
    [handleDeleteClientStorage.EVENT_NAME]: handleDeleteClientStorage
  };
  figma.ui.on("message", (msg) => __async(this, null, function* () {
    const handler = windowHandlers[msg.event];
    if (handler) {
      yield Promise.resolve(handler(msg));
    }
  }));
  function nodeRemovedByUser(node2) {
    if (node2) {
      if (node2.parent === null || node2.parent.parent === null) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }
  function centerInViewport(node2) {
    node2.x = figma.viewport.center.x - node2.width / 2;
    node2.y = figma.viewport.center.y - node2.height / 2;
  }
  function sortNodesByPosition(nodes) {
    var result = nodes.map((x) => x);
    result.sort((current, next) => current.x - next.x);
    return result.sort((current, next) => current.y - next.y);
  }
  var dist = {};
  Object.defineProperty(dist, "__esModule", { value: true });
  function getClientStorageAsync(key2) {
    return __async(this, null, function* () {
      return yield figma.clientStorage.getAsync(key2);
    });
  }
  function setClientStorageAsync(key2, data2) {
    return figma.clientStorage.setAsync(key2, data2);
  }
  function updateClientStorageAsync(key2, callback) {
    return __async(this, null, function* () {
      var data2 = yield figma.clientStorage.getAsync(key2);
      data2 = callback(data2);
      if (!data2) {
        data2 = null;
      } else {
        figma.clientStorage.setAsync(key2, data2);
        return data2;
      }
    });
  }
  const eventListeners = [];
  const dispatchEvent = (action, data2) => {
    figma.ui.postMessage({ action, data: data2 });
  };
  const handleEvent = (action, callback) => {
    eventListeners.push({ action, callback });
  };
  figma.ui.onmessage = (message) => {
    for (let eventListener of eventListeners) {
      if (message.action === eventListener.action)
        eventListener.callback(message.data);
    }
  };
  function isObjLiteral(_obj) {
    var _test = _obj;
    return typeof _obj !== "object" || _obj === null ? false : function() {
      while (true) {
        if (Object.getPrototypeOf(_test = Object.getPrototypeOf(_test)) === null) {
          break;
        }
      }
      return Object.getPrototypeOf(_obj) === _test;
    }();
  }
  const nodeProps = [
    "id",
    "parent",
    "name",
    "removed",
    "visible",
    "locked",
    "children",
    "constraints",
    "absoluteTransform",
    "relativeTransform",
    "x",
    "y",
    "rotation",
    "width",
    "height",
    "constrainProportions",
    "layoutAlign",
    "layoutGrow",
    "opacity",
    "blendMode",
    "isMask",
    "effects",
    "effectStyleId",
    "expanded",
    "backgrounds",
    "backgroundStyleId",
    "fills",
    "strokes",
    "strokeWeight",
    "strokeMiterLimit",
    "strokeAlign",
    "strokeCap",
    "strokeJoin",
    "dashPattern",
    "fillStyleId",
    "strokeStyleId",
    "cornerRadius",
    "cornerSmoothing",
    "topLeftRadius",
    "topRightRadius",
    "bottomLeftRadius",
    "bottomRightRadius",
    "exportSettings",
    "overflowDirection",
    "numberOfFixedChildren",
    "overlayPositionType",
    "overlayBackground",
    "overlayBackgroundInteraction",
    "reactions",
    "description",
    "remote",
    "key",
    "layoutMode",
    "primaryAxisSizingMode",
    "counterAxisSizingMode",
    "primaryAxisAlignItems",
    "counterAxisAlignItems",
    "paddingLeft",
    "paddingRight",
    "paddingTop",
    "paddingBottom",
    "itemSpacing",
    // 'horizontalPadding',
    // 'verticalPadding',
    "layoutGrids",
    "gridStyleId",
    "clipsContent",
    "guides",
    "type",
    "strokeTopWeight",
    "strokeBottomWeight",
    "strokeRightWeight",
    "strokeLeftWeight"
  ];
  const readOnly = [
    "id",
    "parent",
    "removed",
    "children",
    "absoluteTransform",
    "width",
    "height",
    "overlayPositionType",
    "overlayBackground",
    "overlayBackgroundInteraction",
    "reactions",
    "remote",
    "key",
    "type",
    "masterComponent",
    "mainComponent"
  ];
  function copyPaste(source, target, ...args) {
    var targetIsEmpty;
    if (target && Object.keys(target).length === 0 && target.constructor === Object) {
      targetIsEmpty = true;
    }
    var options;
    if (typeof args[0] === "function")
      args[0];
    if (typeof args[1] === "function")
      args[1];
    if (typeof args[0] === "object" && typeof args[0] !== "function")
      options = args[0];
    if (typeof args[0] === "object" && typeof args[0] !== "function")
      options = args[0];
    if (!options)
      options = {};
    const { include, exclude, withoutRelations, removeConflicts } = options;
    let allowlist = nodeProps.filter(function(el) {
      return !readOnly.includes(el);
    });
    if (include) {
      allowlist = include.filter(function(el) {
        return !readOnly.includes(el);
      });
    }
    if (exclude) {
      allowlist = allowlist.filter(function(el) {
        return !exclude.concat(readOnly).includes(el);
      });
    }
    if (target && !targetIsEmpty) {
      allowlist = allowlist.filter(function(el) {
        return !["id", "type"].includes(el);
      });
    }
    var obj = {};
    if (targetIsEmpty) {
      if (obj.id === void 0) {
        obj.id = source.id;
      }
      if (obj.type === void 0) {
        obj.type = source.type;
      }
      if (source.key)
        obj.key = source.key;
    }
    let props;
    if (!isObjLiteral(source)) {
      props = Object.entries(Object.getOwnPropertyDescriptors(source.__proto__));
    } else {
      props = Object.entries(source);
    }
    for (const [key2, value] of props) {
      if (allowlist.includes(key2)) {
        try {
          if (typeof obj[key2] === "symbol") {
            obj[key2] = "Mixed";
          } else {
            if (!isObjLiteral(source)) {
              obj[key2] = value.get.call(source);
            } else {
              obj[key2] = value;
            }
          }
        } catch (err) {
          obj[key2] = void 0;
        }
      }
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
      } else {
        delete obj.textStyleId;
      }
      if (obj.cornerRadius !== figma.mixed) {
        delete obj.topLeftRadius;
        delete obj.topRightRadius;
        delete obj.bottomLeftRadius;
        delete obj.bottomRightRadius;
      } else {
        delete obj.cornerRadius;
      }
    }
    if (targetIsEmpty) {
      if (source.parent && !withoutRelations) {
        obj.parent = { id: source.parent.id, type: source.parent.type };
      }
    }
    if (targetIsEmpty) {
      if (source.type === "FRAME" || source.type === "COMPONENT" || source.type === "COMPONENT_SET" || source.type === "PAGE" || source.type === "GROUP" || source.type === "INSTANCE" || source.type === "DOCUMENT" || source.type === "BOOLEAN_OPERATION") {
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
    if (target.type !== "FRAME" || target.type !== "COMPONENT" || target.type !== "COMPONENT_SET") {
      delete obj.backgrounds;
    }
    Object.assign(target, obj);
    return target;
  }
  function groupToFrame(group) {
    let groupRotation = group.rotation;
    let frame = figma.createFrame();
    frame.fills = [];
    frame.x = group.x;
    frame.y = group.y;
    frame.name = group.name;
    frame.resize(group.width, group.height);
    frame.appendChild(group);
    group.x = 0;
    group.y = 0;
    group.rotation = 0;
    figma.ungroup(group);
    frame.rotation = groupRotation;
    return frame;
  }
  function convertToFrame(node2) {
    let nodeIndex = node2.parent.children.indexOf(node2);
    let nodeParent = node2.parent;
    let newFrame;
    if (node2.type === "INSTANCE") {
      newFrame = node2.detachInstance();
    }
    if (node2.type === "COMPONENT") {
      let frame = node2.createInstance().detachInstance();
      frame.rotation = node2.rotation;
      nodeParent.appendChild(frame);
      copyPaste(node2, frame, { include: ["x", "y"] });
      figma.currentPage.appendChild(frame);
      node2.remove();
      newFrame = frame;
    }
    if (node2.type === "GROUP") {
      let frame = groupToFrame(node2);
      newFrame = frame;
    }
    if (node2.type === "RECTANGLE") {
      let frame = figma.createFrame();
      frame.resizeWithoutConstraints(node2.width, node2.height);
      copyPaste(node2, frame);
      node2.remove();
      newFrame = frame;
    }
    if (node2.type === "FRAME") {
      newFrame = node2;
    }
    nodeParent.insertChild(nodeIndex, newFrame);
    return newFrame;
  }
  function moveChildren(source, target) {
    let children = source.children;
    let length = children.length;
    for (let i = 0; i < length; i++) {
      let child = children[i];
      target.appendChild(child);
    }
    return target;
  }
  function convertToComponent(node2) {
    const component = figma.createComponent();
    node2 = convertToFrame(node2);
    component.resizeWithoutConstraints(node2.width, node2.height);
    copyPaste(node2, component);
    moveChildren(node2, component);
    node2.remove();
    return component;
  }
  function getPluginData(node, key, opts) {
    var data;
    data = node.getPluginData(key);
    if (data) {
      if (typeof data === "string" && data.startsWith(">>>")) {
        data = data;
      } else {
        data = JSON.parse(data);
      }
    } else {
      data = void 0;
    }
    if (typeof data === "string" && data.startsWith(">>>")) {
      data = data.slice(3);
      var string = `(() => {
            return ` + data + `
            })()`;
      data = eval(string);
    }
    return data;
  }
  function setPluginData(node2, key2, data2) {
    if (typeof data2 === "string" && data2.startsWith(">>>")) {
      node2.setPluginData(key2, data2);
      return data2;
    } else {
      node2.setPluginData(key2, JSON.stringify(data2));
      return JSON.stringify(data2);
    }
  }
  function updatePluginData(node2, key2, callback) {
    var data2;
    if (node2.getPluginData(key2)) {
      data2 = JSON.parse(node2.getPluginData(key2));
    } else {
      data2 = null;
    }
    data2 = callback(data2);
    if (!data2) {
      data2 = null;
    }
    node2.setPluginData(key2, JSON.stringify(data2));
    return data2;
  }
  function flipX(node2) {
    let rt = node2.relativeTransform;
    let bounds = node2.absoluteRenderBounds;
    let [[a, c, e], [b, d, f]] = [...rt];
    let mult = a < 0 ? 0 : 1;
    let newAbsX = bounds.x + bounds.width * mult;
    node2.relativeTransform = [
      [a *= -1, c *= -1, newAbsX],
      [b, d, f]
    ];
  }
  function flipY(node2) {
    let rt = node2.relativeTransform;
    let bounds = node2.absoluteRenderBounds;
    let midY = bounds.y + bounds.height / 2;
    let dY = midY - node2.y;
    let newY = node2.y + dY * 2;
    let [[a, c, e], [b, d, f]] = [...rt];
    node2.relativeTransform = [
      [a, c, e],
      [b *= -1, d *= -1, newY]
    ];
  }
  function removeChildren(node2) {
    let length = node2.children.length;
    for (let i = length - 1; i >= 0; i--) {
      node2.children[i].remove();
    }
  }
  function resize(node2, width, height) {
    width === 0 ? width = 1 / Number.MAX_SAFE_INTEGER : null;
    height === 0 ? height = 1 / Number.MAX_SAFE_INTEGER : null;
    let nodeParent = node2.parent;
    node2.resize(width < 0.01 ? 1 : width, height < 0.01 ? 1 : height);
    if (width < 0.01 || height < 0.01) {
      let dummy = figma.createRectangle();
      dummy.resize(width < 0.01 ? 1 / width : width, height < 0.01 ? 1 / height : height);
      let group = figma.group([node2, dummy], figma.currentPage);
      group.resize(width < 0.01 ? 1 : width, height < 0.01 ? 1 : height);
      nodeParent.appendChild(node2);
      group.remove();
    }
    return node2;
  }
  function ungroup(node2, parent) {
    let selection = [];
    let children = node2.children;
    for (let i = 0; i < children.length; i++) {
      parent.appendChild(children[i]);
      selection.push(children[i]);
    }
    if (node2.type !== "GROUP") {
      node2.remove();
    }
    return selection;
  }
  function hexToPaints(hexes) {
    if (typeof hexes === "string") {
      hexes = [hexes];
    }
    const Paints = hexes.map((hex) => {
      let color = hexToRgb(hex);
      if (color == null) {
        throw "Color is null";
      } else {
        let paint = {
          type: "SOLID",
          color: color.color,
          opacity: color.opacity
        };
        return paint;
      }
    });
    return Paints;
  }
  function hexToRgb(hex) {
    hex = hex.replace("#", "");
    hex.length == 3 ? hex += "F" : null;
    hex.length == 4 ? hex = hex.replace(new RegExp("([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])"), "$1$1$2$2$3$3$4$4") : null;
    hex.length == 6 ? hex += "FF" : null;
    console.log(hex);
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      color: {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
      },
      opacity: parseFloat((parseInt(result[4], 16) / 255).toFixed(2))
    } : null;
  }
  function isInsideInstance(node2) {
    const parent = node2.parent;
    if (parent) {
      if (parent && parent.type === "INSTANCE") {
        return true;
      } else if (parent && parent.type === "PAGE") {
        return false;
      } else {
        return isInsideInstance(parent);
      }
    } else {
      return false;
    }
  }
  function getParentInstance(node2) {
    const parent = node2.parent;
    if (node2.type === "PAGE")
      return void 0;
    if (parent.type === "INSTANCE") {
      return parent;
    } else {
      return getParentInstance(parent);
    }
  }
  function getNodeIndex(node2) {
    return node2.parent.children.indexOf(node2);
  }
  function getNodeLocation(node2, container = figma.currentPage, location = []) {
    if (node2 && container) {
      if (node2.id === container.id) {
        if (location.length > 0) {
          location.push(container);
          return location.reverse();
        } else {
          return false;
        }
      } else {
        if (node2.parent) {
          var nodeIndex = getNodeIndex(node2);
          location.push(nodeIndex);
          return getNodeLocation(node2.parent, container, location);
        }
      }
    } else {
      console.error("Node or container not defined");
      return false;
    }
    return false;
  }
  function getInstanceCounterpartUsingLocation(node2, parentInstance = getParentInstance(node2), location = getNodeLocation(node2, parentInstance), parentComponentNode = parentInstance === null || parentInstance === void 0 ? void 0 : parentInstance.mainComponent) {
    if (location) {
      let loopChildren = function(children, d = 0) {
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          var nodeIndex = location[d];
          if (getNodeIndex(child) === nodeIndex) {
            if (location.length - 1 === d) {
              return child;
            } else {
              if (child.children) {
                return loopChildren(child.children, d + 1);
              }
            }
          }
        }
      };
      location.shift();
      if (parentComponentNode && parentComponentNode.children) {
        return loopChildren(parentComponentNode.children);
      } else {
        return node2.mainComponent;
      }
    }
  }
  function getInstanceCounterpart(node2) {
    if (isInsideInstance(node2)) {
      var child = figma.getNodeById(node2.id.split(";").slice(-1)[0]);
      if (child) {
        return child;
      } else {
        getParentInstance(node2);
        return getInstanceCounterpartUsingLocation(node2);
      }
    }
  }
  function getNodeDepth(node2, container = figma.currentPage, depth = 0) {
    if (node2) {
      if (node2.id === container.id) {
        return depth;
      } else {
        depth += 1;
        return getNodeDepth(node2.parent, container, depth);
      }
    }
  }
  function getNoneGroupParent(node2) {
    var _a, _b, _c;
    if (((_a = node2.parent) === null || _a === void 0 ? void 0 : _a.type) === "BOOLEAN_OPERATION" || ((_b = node2.parent) === null || _b === void 0 ? void 0 : _b.type) === "COMPONENT_SET" || ((_c = node2.parent) === null || _c === void 0 ? void 0 : _c.type) === "GROUP") {
      return getNoneGroupParent(node2.parent);
    } else {
      return node2.parent;
    }
  }
  const nodeToObject = (node2, options) => {
    const props = Object.entries(Object.getOwnPropertyDescriptors(node2.__proto__));
    const blacklist = [
      "parent",
      "children",
      "removed",
      "masterComponent",
      "horizontalPadding",
      "verticalPadding"
    ];
    const obj = { id: node2.id, type: node2.type };
    for (const [name, prop] of props) {
      if (prop.get && !blacklist.includes(name)) {
        try {
          if (typeof obj[name] === "symbol") {
            obj[name] = "Mixed";
          } else {
            obj[name] = prop.get.call(node2);
          }
        } catch (err) {
          obj[name] = void 0;
        }
      }
    }
    if (node2.parent && !(options === null || options === void 0 ? void 0 : options.withoutRelations)) {
      obj.parent = { id: node2.parent.id, type: node2.parent.type };
    }
    if (node2.children && !(options === null || options === void 0 ? void 0 : options.withoutRelations)) {
      obj.children = node2.children.map((child) => nodeToObject(child, options));
    }
    if (node2.masterComponent && !(options === null || options === void 0 ? void 0 : options.withoutRelations)) {
      obj.masterComponent = nodeToObject(node2.masterComponent, options);
    }
    if (!(options === null || options === void 0 ? void 0 : options.removeConflicts)) {
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
      } else {
        delete obj.textStyleId;
      }
      if (obj.cornerRadius !== figma.mixed) {
        delete obj.topLeftRadius;
        delete obj.topRightRadius;
        delete obj.bottomLeftRadius;
        delete obj.bottomRightRadius;
      } else {
        delete obj.cornerRadius;
      }
    }
    if ((options === null || options === void 0 ? void 0 : options.pluginData) && node2.getPluginDataKeys().length > 0) {
      obj.pluginData = {};
      node2.getPluginDataKeys().forEach((key2) => {
        obj.pluginData[key2] = node2.getPluginData(key2);
      });
      Object.getOwnPropertyNames(obj.pluginData).length === 0 ? delete obj.pluginData : null;
    }
    if (options === null || options === void 0 ? void 0 : options.sharedPluginDataNamespaces) {
      obj.sharedPluginData = {};
      options === null || options === void 0 ? void 0 : options.sharedPluginDataNamespaces.forEach((namespace) => {
        obj.sharedPluginData[namespace] = {};
        node2.getSharedPluginDataKeys(namespace).forEach((key2) => {
          obj.sharedPluginData[namespace][key2] = node2.getSharedPluginData(namespace, key2);
        });
        Object.getOwnPropertyNames(obj.sharedPluginData[namespace]).length === 0 ? delete obj.sharedPluginData[namespace] : null;
      });
      Object.getOwnPropertyNames(obj.sharedPluginData).length === 0 ? delete obj.sharedPluginData : null;
    }
    return obj;
  };
  function getOverrides(node2, prop) {
    if (isInsideInstance(node2)) {
      var componentNode = getInstanceCounterpart(node2);
      var properties = nodeToObject(node2);
      var overriddenProps = {};
      if (prop) {
        if (prop !== "key" && prop !== "mainComponent" && prop !== "absoluteTransform" && prop !== "type" && prop !== "id" && prop !== "parent" && prop !== "children" && prop !== "masterComponent" && prop !== "mainComponent" && prop !== "horizontalPadding" && prop !== "verticalPadding" && prop !== "reactions" && prop !== "overlayPositionType" && prop !== "overflowDirection" && prop !== "numberOfFixedChildren" && prop !== "overlayBackground" && prop !== "overlayBackgroundInteraction" && prop !== "remote" && prop !== "defaultVariant" && prop !== "hasMissingFont" && prop !== "exportSettings" && prop !== "autoRename") {
          if (JSON.stringify(node2[prop]) !== JSON.stringify(componentNode[prop])) {
            return node2[prop];
          }
        }
      } else {
        for (let [key2, value] of Object.entries(properties)) {
          if (key2 !== "key" && key2 !== "mainComponent" && key2 !== "absoluteTransform" && key2 !== "type" && key2 !== "id" && key2 !== "parent" && key2 !== "children" && key2 !== "masterComponent" && key2 !== "mainComponent" && key2 !== "horizontalPadding" && key2 !== "verticalPadding" && key2 !== "reactions" && key2 !== "overlayPositionType" && key2 !== "overflowDirection" && key2 !== "numberOfFixedChildren" && key2 !== "overlayBackground" && key2 !== "overlayBackgroundInteraction" && key2 !== "remote" && key2 !== "defaultVariant" && key2 !== "hasMissingFont" && key2 !== "exportSettings" && key2 !== "autoRename") {
            if (JSON.stringify(properties[key2]) !== JSON.stringify(componentNode[key2])) {
              overriddenProps[key2] = value;
            }
          }
        }
        if (JSON.stringify(overriddenProps) === "{}") {
          return false;
        } else {
          return overriddenProps;
        }
      }
    }
  }
  function getPageNode(node2) {
    if (node2.parent.type === "PAGE") {
      return node2.parent;
    } else {
      return getPageNode(node2.parent);
    }
  }
  function getTopInstance(node2) {
    if (node2.type === "PAGE")
      return null;
    if (isInsideInstance(node2)) {
      if (isInsideInstance(node2.parent)) {
        return getTopInstance(node2.parent);
      } else {
        return node2.parent;
      }
    }
  }
  function makeComponent(nodes) {
    if (!Array.isArray(nodes)) {
      nodes = [nodes];
    }
    let parent = nodes[0].parent;
    if (nodes.length === 1 && (nodes[0].type === "FRAME" || nodes[0].type === "GROUP")) {
      let component = convertToComponent(nodes[0]);
      return component;
    } else {
      let component = figma.createComponent();
      let group = figma.group(nodes, parent);
      component.resizeWithoutConstraints(group.width, group.height);
      copyPaste(group, component, { include: ["x", "y"] });
      group.x = 0;
      group.y = 0;
      console.log("where the children go");
      if (nodes.length === 1) {
        component.name = nodes[0].name;
      }
      ungroup(group, component);
      return component;
    }
  }
  function isFunction(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === "[object Function]";
  }
  function replace(target, source) {
    let isSelection = false;
    let targetCopy;
    let clonedSelection = [];
    let nodeIndex;
    let parent;
    if (Array.isArray(target)) {
      nodeIndex = getNodeIndex(target[0]);
      parent = target[0].parent;
      for (let i = 0; i < target.length; i++) {
        let clone = target[i].clone();
        clonedSelection.push(clone);
      }
      targetCopy = figma.group(clonedSelection, parent, nodeIndex);
      targetCopy.x = target[0].x;
      targetCopy.y = target[0].y;
      isSelection = true;
      nodeIndex = getNodeIndex(targetCopy);
      parent = targetCopy.parent;
    } else {
      targetCopy = nodeToObject(target);
      nodeIndex = getNodeIndex(target);
      parent = target.parent;
    }
    let targetWidth = targetCopy.width;
    let targetHeight = targetCopy.height;
    let result;
    if (isFunction(source)) {
      result = source(target);
    } else {
      result = source;
    }
    if (result) {
      result.resizeWithoutConstraints(targetWidth, targetHeight);
      copyPaste(targetCopy, result, { include: ["x", "y", "constraints"] });
      result.x = targetCopy.x;
      result.y = targetCopy.y;
      parent.insertChild(nodeIndex, result);
      if (isSelection) {
        targetCopy.remove();
      }
      if (figma.getNodeById(target.id)) {
        target.remove();
      }
      return result;
    }
  }
  function setDocumentData(key2, data2) {
    return setPluginData(figma.root, key2, data2);
  }
  function getDocumentData(key2) {
    return getPluginData(figma.root, key2);
  }
  function updateDocumentData(node2, key2, callback) {
    return updatePluginData(node2, key2, callback);
  }
  function genUID() {
    return `${figma.currentUser.id + "-" + figma.currentUser.sessionId + "-" + (/* @__PURE__ */ new Date()).valueOf()}`;
  }
  function addUniqueToArray(array, object) {
    var index = array.findIndex((x) => x.id === object.id);
    index === -1 ? array.push(object) : false;
    return array;
  }
  function isUnique(array, object) {
    var index = array.findIndex((x) => x.id === object.id);
    return index === -1 ? true : false;
  }
  function move(array, from, to, replaceWith) {
    let element = array.splice(from, 1)[0];
    if (replaceWith) {
      array.splice(to, 0, replaceWith);
    } else {
      array.splice(to, 0, element);
    }
    return array;
  }
  function upsert(array, cb, entry) {
    array.some((item, index) => {
      let result = false;
      if (true === cb(array[index])) {
        result = true;
        if (entry) {
          move(array, index, 0, entry);
        } else {
          move(array, index, 0);
        }
      }
      return result;
    });
    let matchFound = false;
    array.map((item, index) => {
      if (true === cb(array[index])) {
        matchFound = true;
      }
    });
    if (!matchFound) {
      array.unshift(entry);
    }
    return array;
  }
  function File(data2) {
    this.id = getDocumentData("fileId") || setDocumentData("fileId", genUID()).replace(/['"]+/g, "");
    this.name = figma.root.name;
    this.firstVisited = (/* @__PURE__ */ new Date()).toISOString();
    this.lastVisited = (/* @__PURE__ */ new Date()).toISOString();
    if (data2) {
      this.data = data2;
      setDocumentData("fileData", data2);
    } else {
      this.data = getDocumentData("fileData");
    }
  }
  function getRecentFilesAsync(fileData, opts2) {
    return __async(this, null, function* () {
      opts2 = opts2 || {};
      fileData = fileData || getDocumentData("fileData");
      let recentFiles = yield updateClientStorageAsync("recentFiles", (recentFiles2) => {
        recentFiles2 = recentFiles2 || [];
        const currentFile = new File(fileData);
        if (recentFiles2.length === 0) {
          if (fileData.length > 0)
            recentFiles2.push(currentFile);
        } else {
          if (!isUnique(recentFiles2, currentFile)) {
            let [id, sessionId, timestamp] = currentFile.id.split("-");
            if (id === figma.currentUser.id && sessionId !== figma.currentUser.sessionId.toString() && figma.root.name.endsWith("(Copy)") && !getDocumentData("duplicateResolved")) {
              currentFile.id = setDocumentData("fileId", genUID()).replace(/['"]+/g, "");
              setDocumentData("duplicateResolved", true);
            }
          }
          if (!figma.root.name.endsWith("(Copy)")) {
            setDocumentData("duplicateResolved", "");
          }
          addUniqueToArray(recentFiles2, currentFile);
          if (recentFiles2.length > 0) {
            recentFiles2.filter((item, i) => {
              if (item.id === currentFile.id) {
                item.name = currentFile.name;
                item.lastVisited = (/* @__PURE__ */ new Date()).toISOString();
                item.data = currentFile.data;
                setDocumentData("fileData", fileData);
                if (!fileData || Array.isArray(fileData) && fileData.length === 0) {
                  recentFiles2.splice(i, 1);
                }
              }
            });
            recentFiles2.sort((a, b) => {
              if (a.lastVisited === b.lastVisited)
                return 0;
              if (typeof a.lastVisited === "undefined" || typeof b.lastVisited === "undefined")
                return 0;
              return a.lastVisited > b.lastVisited ? -1 : 1;
            });
            if (opts2.expire) {
              recentFiles2.map((file) => {
                let fileTimestamp = new Date(file.lastVisited).valueOf();
                let currentTimestamp = (/* @__PURE__ */ new Date()).valueOf();
                if (fileTimestamp < currentTimestamp - opts2.expire) {
                  let fileIndex = recentFiles2.indexOf(file);
                  if (fileIndex !== -1) {
                    recentFiles2.splice(fileIndex, 1);
                  }
                }
              });
            }
            if (opts2.limit) {
              recentFiles2 = recentFiles2.slice(0, opts2.limit);
            }
          }
        }
        return recentFiles2;
      });
      if (recentFiles.length > 0) {
        recentFiles = recentFiles.filter((file) => {
          return !(file.id === getPluginData(figma.root, "fileId"));
        });
      }
      return recentFiles;
    });
  }
  function addRecentFileAsync(file) {
    return __async(this, null, function* () {
      return yield updateClientStorageAsync("recentFiles", (recentFiles) => {
        recentFiles = recentFiles || [];
        recentFiles = upsert(recentFiles, (item) => item.id === file.id, file);
        return recentFiles;
      });
    });
  }
  function getRemoteFilesAsync(fileId) {
    return __async(this, null, function* () {
      var recentFiles = yield getClientStorageAsync("recentFiles");
      return updatePluginData(figma.root, "remoteFiles", (remoteFiles) => {
        remoteFiles = remoteFiles || [];
        if (fileId) {
          let fileAlreadyExists = remoteFiles.find((file2) => file2.id === fileId);
          let recentFile2 = recentFiles.find((file2) => file2.id === fileId);
          if (!fileAlreadyExists) {
            remoteFiles.push(recentFile2);
          }
        }
        if (recentFiles.length > 0) {
          for (let i2 = 0; i2 < remoteFiles.length; i2++) {
            var remoteFile = remoteFiles[i2];
            for (let x = 0; x < recentFiles.length; x++) {
              var recentFile = recentFiles[x];
              if (recentFile.id === remoteFile.id) {
                remoteFiles[i2] = recentFile;
              }
            }
          }
          remoteFiles = remoteFiles.filter((file2) => {
            return !(file2.id === getPluginData(figma.root, "fileId"));
          });
        }
        if (remoteFiles.length > 0) {
          for (var i = 0; i < remoteFiles.length; i++) {
            var file = remoteFiles[i];
            if (file.data[0]) {
              figma.importComponentByKeyAsync(file.data[0].component.key).then((component) => {
                var remoteTemplate = getPluginData(component, "template");
                updatePluginData(figma.root, "remoteFiles", (remoteFiles2) => {
                  remoteFiles2.map((file2) => {
                    if (file2.id === remoteTemplate.file.id) {
                      file2.name = remoteTemplate.file.name;
                    }
                  });
                  return remoteFiles2;
                });
              }).catch((error) => {
                console.log(error);
              });
            }
          }
        }
        return remoteFiles;
      });
    });
  }
  function removeRemoteFile(fileId) {
    return updatePluginData(figma.root, "remoteFiles", (remoteFiles) => {
      let fileIndex = remoteFiles.findIndex((file) => {
        return file.id === fileId;
      });
      if (fileIndex !== -1) {
        remoteFiles.splice(fileIndex, 1);
      }
      return remoteFiles;
    });
  }
  function incrementName(name, array) {
    let nameToMatch = name;
    if (array && array.length > 1) {
      array.sort((a, b) => {
        if (a.name === b.name)
          return 0;
        return a.name > b.name ? -1 : 1;
      });
      nameToMatch = array[0].name;
    }
    let matches = nameToMatch.match(/^(.*\S)(\s*)(\d+)$/);
    if (matches && !(array && array.length === 0)) {
      name = `${matches[1]}${matches[2]}${parseInt(matches[3], 10) + 1}`;
    }
    return name;
  }
  function prompt(title, description, value, isplaceholder) {
    return __async(this, null, function* () {
      let t = Date.now();
      let input = isplaceholder ? `placeholder="${value}"` : `value="${value}"`;
      let disabled = isplaceholder ? "disabled" : "";
      figma.showUI(`

<body>  
    <h2>${title}</h2>

    <p>${description}</p>
        <input id="prompt" type="text" ${input} onkeyup="success()" "/>
        <button id="button" ${disabled} onclick="myFunction()">Ok</button>
    <script>


const input = document.getElementById("prompt");
input.focus()


input.addEventListener("keyup", function(event) {

  if (event.keyCode === 13) {

    event.preventDefault();

    document.getElementById("button").click();
  }
});


    function success() {
        if(document.getElementById("prompt").value==="") { 
               document.getElementById('button').disabled = true; 
           } else { 
               document.getElementById('button').disabled = false;
           }
       }

        function myFunction(){
            parent.postMessage({ pluginMessage: {"type": 'prompt${t}',   "value": document.getElementById('prompt').value} }, '*')
        }



    <\/script>
</body>
<style>
body {
    padding: 20px;
    flex-direction: column;
    margin: 0
}

h2,
p {
    font-size: 13px;
    color: #000;
    margin: 0 0 8px
}

p {
    font-size: 11px;
    color: #333
}

button,
input {
    padding: 4px;
    font-size: 11px;
    font-weight: 400
}

body,
button {
    display: flex;
    font-family: 'Inter', sans-serif
}

button {
    align-items: center;
    border-radius: 4px;
    color: #fff;
    flex-shrink: 0;
    font-weight: 500;
    height: 32px;
    padding: 0 8px;
    text-decoration: none;
    outline: 0;
    border: 2px solid transparent;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    position: fixed;
    bottom: 20px;
    right: 20px;
    min-width: 64px;
    justify-content: center;
    background-color: #18a0fb
}

button:disabled {
    background-color: #b3b3b3
}

div {
    display: flex;
    flex-direction: row
}
</style>
`, {
        width: 300,
        height: 150
      });
      new Promise((resolve) => {
        figma.ui.onmessage = (message) => {
          if (message.type == "prompt" + t) {
            console.log(message.value);
          }
        };
      });
      const returnData = yield new Promise((resolve, reject) => {
        figma.ui.onmessage = (message) => {
          if (message.type == "prompt" + t) {
            figma.ui.close();
            resolve(message.value);
          }
        };
        figma.on("close", () => {
          reject("plugin closed");
        });
      });
      return returnData;
    });
  }
  dist.addRecentFileAsync = addRecentFileAsync;
  dist.convertToComponent = convertToComponent;
  dist.convertToFrame = convertToFrame;
  var copyPaste_1 = dist.copyPaste = copyPaste;
  dist.dispatchEvent = dispatchEvent;
  dist.flipX = flipX;
  dist.flipY = flipY;
  dist.genUID = genUID;
  dist.getClientStorageAsync = getClientStorageAsync;
  dist.getDocumentData = getDocumentData;
  dist.getInstanceCounterpart = getInstanceCounterpart;
  dist.getInstanceCounterpartUsingLocation = getInstanceCounterpartUsingLocation;
  dist.getNodeDepth = getNodeDepth;
  dist.getNodeIndex = getNodeIndex;
  dist.getNodeLocation = getNodeLocation;
  dist.getNoneGroupParent = getNoneGroupParent;
  dist.getOverrides = getOverrides;
  var getPageNode_1 = dist.getPageNode = getPageNode;
  dist.getParentInstance = getParentInstance;
  dist.getPluginData = getPluginData;
  dist.getRecentFilesAsync = getRecentFilesAsync;
  dist.getRemoteFilesAsync = getRemoteFilesAsync;
  dist.getTopInstance = getTopInstance;
  dist.handleEvent = handleEvent;
  dist.hexToPaints = hexToPaints;
  dist.hexToRgb = hexToRgb;
  dist.incrementName = incrementName;
  dist.isInsideInstance = isInsideInstance;
  dist.makeComponent = makeComponent;
  dist.nodeToObject = nodeToObject;
  dist.prompt = prompt;
  dist.removeChildren = removeChildren;
  dist.removeRemoteFile = removeRemoteFile;
  dist.replace = replace;
  dist.resize = resize;
  dist.setClientStorageAsync = setClientStorageAsync;
  dist.setDocumentData = setDocumentData;
  dist.setPluginData = setPluginData;
  dist.ungroup = ungroup;
  dist.updateClientStorageAsync = updateClientStorageAsync;
  dist.updateDocumentData = updateDocumentData;
  dist.updatePluginData = updatePluginData;
  const styleProps = [
    // 'constrainProportions',
    // 'layoutAlign',
    // 'layoutGrow',
    "opacity",
    "blendMode",
    "effects",
    "effectStyleId",
    // 'expanded',
    "backgrounds",
    "backgroundStyleId",
    "fills",
    "strokes",
    "strokeWeight",
    "strokeMiterLimit",
    "strokeAlign",
    "strokeCap",
    "strokeJoin",
    "dashPattern",
    "fillStyleId",
    "strokeStyleId",
    "cornerRadius",
    "cornerSmoothing",
    "topLeftRadius",
    "topRightRadius",
    "bottomLeftRadius",
    "bottomRightRadius",
    // 'layoutMode',
    // 'primaryAxisSizingMode',
    // 'counterAxisSizingMode',
    // 'primaryAxisAlignItems',
    // 'counterAxisAlignItems',
    "paddingLeft",
    "paddingRight",
    "paddingTop",
    "paddingBottom",
    "itemSpacing",
    "layoutGrids",
    "gridStyleId"
    // 'clipsContent',
    // 'guides'
  ];
  function copyPasteStyle(source, target) {
    if (target) {
      return copyPaste_1(source, target, {
        include: styleProps,
        exclude: [
          "autoRename",
          "characters",
          "fontName",
          "fontSize",
          "rotation",
          "primaryAxisSizingMode",
          "counterAxisSizingMode",
          "primaryAxisAlignItems",
          "counterAxisAlignItems",
          "constrainProportions",
          "layoutAlign",
          "layoutGrow",
          "layoutMode"
        ]
      });
    } else {
      return copyPaste_1(source, {});
    }
  }
  function getInstances(styleId) {
    return figma.root.findAll(
      (node2) => node2.getPluginData("styleId") === styleId
    );
  }
  function addLayerStyle(node2) {
    return __async(this, null, function* () {
      var layerStyles = getLayerStyles();
      for (let i = 0; i < layerStyles.length; i++) {
        var layerStyle = layerStyles[i];
        if (layerStyle.id === node2.id) {
          console.log("Layer style already exists");
          figma.notify("Layer style already exists");
          return;
        }
      }
      var newLayerStyle = {
        id: node2.id,
        node: copyPasteStyle(node2),
        name: node2.name
      };
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
    } else {
      styles = [];
    }
    if (id) {
      var newStyles = styles.filter(function(style) {
        return style.id === id;
      });
      styles = newStyles[0];
    }
    return styles;
  }
  function updateInstances(selection, id) {
    var nodes;
    if (selection) {
      nodes = selection;
    }
    if (id) {
      nodes = [];
      var pages = figma.root.children;
      var length = pages.length;
      for (let i = 0; i < length; i++) {
        pages[i].findAll((node22) => {
          if (node22.getPluginData("styleId") === id) {
            nodes.push(node22);
          }
        });
      }
    }
    for (let i = 0; i < nodes.length; i++) {
      var node2 = nodes[i];
      var styleId = node2.getPluginData("styleId");
      var source = figma.getNodeById(styleId);
      var layerStyle;
      if (source) {
        layerStyle = source;
        updateLayerStyle(styleId, null, copyPasteStyle(layerStyle));
        copyPasteStyle(layerStyle, node2);
      } else {
        layerStyle = getLayerStyles(styleId).node;
        copyPasteStyle(layerStyle, node2);
        console.log("Original node can't be found");
      }
    }
  }
  function clearLayerStyle() {
    figma.root.setPluginData("styles", "");
    console.log("Styles cleared");
    figma.closePlugin();
  }
  function createStyles(selection) {
    return __async(this, null, function* () {
      if (selection.length > 0) {
        if (selection.length <= 20) {
          selection = sortNodesByPosition(selection);
          for (var i = 0; i < selection.length; i++) {
            var node2 = selection[i];
            node2.setPluginData("styleId", node2.id);
            addLayerStyle(node2);
          }
        } else {
          figma.notify("Limited to 20 layer styles at a time");
        }
      } else {
        figma.notify("No layers selected");
      }
    });
  }
  function applyLayerStyle(selection, styleId) {
    var layerStyle;
    layerStyle = getLayerStyles(styleId).node;
    var source = figma.getNodeById(styleId);
    if (selection.length <= 100) {
      if (selection.length > 0) {
        for (let i = 0; i < selection.length; i++) {
          var node2 = selection[i];
          node2.setPluginData("styleId", styleId);
          node2.setRelaunchData({
            detachLayerStyle: "Removes association with layer style"
          });
          if (source) {
            layerStyle = source;
            copyPasteStyle(layerStyle, node2);
          } else {
            copyPasteStyle(layerStyle, node2);
            console.log("Original node can't be found");
          }
        }
        figma.notify("Layer style applied");
      } else {
        figma.notify("Please select a layer");
      }
    } else {
      figma.notify("Limited to 100 layers at a time");
    }
  }
  function removeLayerStyle(styleId) {
    var styles = getLayerStyles();
    styles.splice(
      styles.findIndex((node2) => {
        return node2.id === styleId;
      }),
      1
    );
    figma.root.setPluginData("styles", JSON.stringify(styles));
    figma.root.findAll((node2) => {
      if (node2.getPluginData("styleId") === styleId) {
        node2.setPluginData("styleId", "");
      }
    });
  }
  function detachLayerStyle(node2) {
    node2.setPluginData("styleId", "");
    node2.setRelaunchData({});
  }
  function postMessage() {
    var styles = getLayerStyles();
    figma.ui.postMessage(styles);
  }
  var nodeBeingEdited = null;
  function checkNodeBeingEdited(selection) {
    if (selection && selection.length === 1) {
      var node2 = selection[0];
      if (node2.id === node2.getPluginData("styleId")) {
        console.log("Selection is main layer style");
        nodeBeingEdited = node2;
      }
    }
  }
  function updatePreview(nodeBeingEdited2) {
    if (nodeBeingEdited2) {
      var layerStyleId = nodeBeingEdited2.getPluginData("styleId");
      var properties = copyPasteStyle(nodeBeingEdited2);
      updateLayerStyle(layerStyleId, null, properties);
      postMessage();
    }
  }
  function plugmaMain() {
    figma.on("selectionchange", () => {
      checkNodeBeingEdited(figma.currentPage.selection);
      console.log("Selection changed");
      if (nodeBeingEdited) {
        setInterval(() => {
          updatePreview(nodeBeingEdited);
        }, 600);
      }
      if (figma.currentPage.selection.length === 0) {
        nodeBeingEdited = null;
      }
    });
    if (figma.command === "showStyles") {
      customShowUI(__html__, { width: 240, height: 360, themeColors: true });
      postMessage();
      figma.ui.onmessage = (msg) => {
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
          var node22 = figma.currentPage.selection[0];
          var properties = copyPasteStyle(node22);
          updateLayerStyle(msg.id, null, properties, node22.id);
          figma.currentPage.selection[0].setPluginData(
            "styleId",
            node22.id
          );
          postMessage();
        }
        if (msg.type === "edit-layer-style") {
          var node22 = figma.getNodeById(msg.id);
          if (!nodeRemovedByUser(node22)) {
            figma.viewport.scrollAndZoomIntoView([node22]);
            figma.viewport.zoom = 0.25;
            figma.currentPage = getPageNode_1(node22);
            figma.currentPage.selection = [node22];
          } else {
            node22 = figma.createFrame();
            var newStyleId = node22.id;
            var properties = getLayerStyles(msg.id);
            copyPasteStyle(properties.node, node22);
            centerInViewport(node22);
            node22.name = `${properties.name}`;
            figma.viewport.scrollAndZoomIntoView([node22]);
            figma.viewport.zoom = 0.25;
            node22.setPluginData("styleId", node22.id);
            updateLayerStyle(msg.id, null, null, node22.id);
            var instances = getInstances(msg.id);
            instances.map((node3) => {
              node3.setPluginData("styleId", newStyleId);
            });
            figma.currentPage.selection = [node22];
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
    }
    if (figma.command === "detachLayerStyle") {
      for (var i = 0; i < figma.currentPage.selection.length; i++) {
        var node2 = figma.currentPage.selection[i];
        detachLayerStyle(node2);
      }
      figma.notify("Layer style detached");
      figma.closePlugin();
    }
  }
  plugmaMain();
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vdmlydHVhbDpwbHVnbWEiLCIuLi9zcmMvY29kZS9oZWxwZXJzLnRzIiwiLi4vbm9kZV9tb2R1bGVzL0BmaWduaXRlL2hlbHBlcnMvZGlzdC9pbmRleC5qcyIsIi4uL3NyYy9jb2RlL2NvZGUudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wcml2YXRlL3Zhci9mb2xkZXJzL3dyLzU1YzAzOXIxNzN6NnRtMWMyM2I4OWQ3cjAwMDBnbi9UL3RlbXBfMTc0NTUwODUzMTExNy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBydW50aW1lRGF0YSA9IHtcbiAgXCJtb2RlXCI6IFwiZGV2ZWxvcG1lbnRcIixcbiAgXCJvdXRwdXRcIjogXCJkaXN0XCIsXG4gIFwid2Vic29ja2V0c1wiOiB0cnVlLFxuICBcImRlYnVnXCI6IGZhbHNlLFxuICBcImluc3RhbmNlSWRcIjogXCJXSHNuQWFPZEg3R1pzd05YeE12TnlcIixcbiAgXCJwb3J0XCI6IDUxMTEsXG4gIFwiY29tbWFuZFwiOiBcImRldlwiLFxuICBcImN3ZFwiOiBcIi9Vc2Vycy9nYXZpbm1jZmFybGFuZC9EZXZlbG9wZXIvcmVwb3MvZmlnbWEtbGF5ZXItc3R5bGVzXCIsXG4gIFwibWFuaWZlc3RcIjoge1xuICAgIFwibmFtZVwiOiBcIkxheWVyIFN0eWxlc1wiLFxuICAgIFwiaWRcIjogXCI5MDgzMDM0ODM0OTUwOTEyNjdcIixcbiAgICBcImFwaVwiOiBcIjEuMC4wXCIsXG4gICAgXCJtYWluXCI6IFwic3JjL2NvZGUvY29kZS50c1wiLFxuICAgIFwidWlcIjogXCJzcmMvdWkvbWFpbi50c1wiLFxuICAgIFwibWVudVwiOiBbXG4gICAgICB7XG4gICAgICAgIFwibmFtZVwiOiBcIlNob3cgTGF5ZXIgU3R5bGVzXCIsXG4gICAgICAgIFwiY29tbWFuZFwiOiBcInNob3dTdHlsZXNcIlxuICAgICAgfVxuICAgIF0sXG4gICAgXCJyZWxhdW5jaEJ1dHRvbnNcIjogW1xuICAgICAge1xuICAgICAgICBcImNvbW1hbmRcIjogXCJkZXRhY2hMYXllclN0eWxlXCIsXG4gICAgICAgIFwibmFtZVwiOiBcIkRldGFjaCBMYXllciBTdHlsZVwiLFxuICAgICAgICBcIm11bHRpcGxlU2VsZWN0aW9uXCI6IHRydWVcbiAgICAgIH1cbiAgICBdLFxuICAgIFwibmV0d29ya0FjY2Vzc1wiOiB7XG4gICAgICBcImFsbG93ZWREb21haW5zXCI6IFtcbiAgICAgICAgXCJub25lXCJcbiAgICAgIF0sXG4gICAgICBcImRldkFsbG93ZWREb21haW5zXCI6IFtcbiAgICAgICAgXCJodHRwOi8vbG9jYWxob3N0OjUxMTFcIixcbiAgICAgICAgXCJ3czovL2xvY2FsaG9zdDo1MTEyXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIFwiZWRpdG9yVHlwZVwiOiBbXG4gICAgICBcImZpZ21hXCJcbiAgICBdXG4gIH1cbn07XG5cblx0XHRcdFx0YXN5bmMgZnVuY3Rpb24gaGFuZGxlRGVsZXRlQ2xpZW50U3RvcmFnZShfbXNnKSB7XG4gIGNvbnN0IGNsaWVudFN0b3JhZ2VLZXlzID0gYXdhaXQgZmlnbWEuY2xpZW50U3RvcmFnZS5rZXlzQXN5bmMoKTtcbiAgZm9yIChjb25zdCBrZXkgb2YgY2xpZW50U3RvcmFnZUtleXMpIHtcbiAgICBpZiAoa2V5ICE9PSBcImZpZ21hLXN0eWxlc2hlZXRcIikge1xuICAgICAgYXdhaXQgZmlnbWEuY2xpZW50U3RvcmFnZS5kZWxldGVBc3luYyhrZXkpO1xuICAgICAgY29uc29sZS5sb2coYFtwbHVnbWFdICR7a2V5fSBkZWxldGVkIGZyb20gY2xpZW50U3RvcmFnZWApO1xuICAgIH1cbiAgfVxuICBmaWdtYS5ub3RpZnkoXCJDbGllbnRTdG9yYWdlIGRlbGV0ZWRcIik7XG59XG5oYW5kbGVEZWxldGVDbGllbnRTdG9yYWdlLkVWRU5UX05BTUUgPSBcIlBMVUdNQV9ERUxFVEVfQ0xJRU5UX1NUT1JBR0VcIjtcblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlRGVsZXRlUm9vdFBsdWdpbkRhdGEoKSB7XG4gIGNvbnN0IHBsdWdpbkRhdGFLZXlzID0gZmlnbWEucm9vdC5nZXRQbHVnaW5EYXRhS2V5cygpO1xuICBmb3IgKGNvbnN0IGtleSBvZiBwbHVnaW5EYXRhS2V5cykge1xuICAgIGZpZ21hLnJvb3Quc2V0UGx1Z2luRGF0YShrZXksIFwiXCIpO1xuICAgIGNvbnNvbGUubG9nKGBbcGx1Z21hXSAke2tleX0gZGVsZXRlZCBmcm9tIHJvb3QgcGx1Z2luRGF0YWApO1xuICB9XG4gIGZpZ21hLm5vdGlmeShcIlJvb3QgcGx1Z2luRGF0YSBkZWxldGVkXCIpO1xufVxuaGFuZGxlRGVsZXRlUm9vdFBsdWdpbkRhdGEuRVZFTlRfTkFNRSA9IFwiUExVR01BX0RFTEVURV9ST09UX1BMVUdJTl9EQVRBXCI7XG5cbmNvbnN0IGZpZ21hQXBpID0ge1xuICByZXNpemU6IGZpZ21hLnVpLnJlc2l6ZS5iaW5kKGZpZ21hLnVpKSxcbiAgc2hvd1VJOiBmaWdtYS5zaG93VUkuYmluZChmaWdtYSksXG4gIHJlcG9zaXRpb246IGZpZ21hLnVpLnJlcG9zaXRpb24uYmluZChmaWdtYS51aSlcbn07XG5cbmNvbnN0IGRlZmF1bHRTZXR0aW5ncyA9IHtcbiAgd2lkdGg6IDMwMCxcbiAgaGVpZ2h0OiAyMDAsXG4gIG1pbmltaXplZDogZmFsc2UsXG4gIHRvb2xiYXJFbmFibGVkOiBmYWxzZVxufTtcbmNvbnN0IGRlZmF1bHRQcmV2aWV3U2V0dGluZ3MgPSB7XG4gIHdpZHRoOiAzMDAsXG4gIGhlaWdodDogMjAwLFxuICBtaW5pbWl6ZWQ6IHRydWUsXG4gIHRvb2xiYXJFbmFibGVkOiB0cnVlXG59O1xuY29uc3QgREVGQVVMVF9XSU5ET1dfU0VUVElOR1MgPSB7XG4gIGRldjogZGVmYXVsdFNldHRpbmdzLFxuICBwcmV2aWV3OiBkZWZhdWx0UHJldmlld1NldHRpbmdzLFxuICBidWlsZDogZGVmYXVsdFNldHRpbmdzLFxuICB0ZXN0OiBkZWZhdWx0U2V0dGluZ3Ncbn07XG5jb25zdCBUT09MQkFSX0hFSUdIVCQxID0gNDE7XG5hc3luYyBmdW5jdGlvbiBnZXRXaW5kb3dTZXR0aW5ncyhvcHRpb25zKSB7XG4gIGNvbnN0IGNvbW1hbmQgPSBydW50aW1lRGF0YS5jb21tYW5kO1xuICBjb25zdCBzdG9yYWdlS2V5RGV2ID0gXCJQTFVHTUFfUExVR0lOX1dJTkRPV19TRVRUSU5HU19ERVZcIjtcbiAgY29uc3Qgc3RvcmFnZUtleVByZXZpZXcgPSBcIlBMVUdNQV9QTFVHSU5fV0lORE9XX1NFVFRJTkdTX1BSRVZJRVdcIjtcbiAgbGV0IHBsdWdpbldpbmRvd1NldHRpbmdzO1xuICBpZiAoY29tbWFuZCA9PT0gXCJkZXZcIikge1xuICAgIHBsdWdpbldpbmRvd1NldHRpbmdzID0gYXdhaXQgZmlnbWEuY2xpZW50U3RvcmFnZS5nZXRBc3luYyhzdG9yYWdlS2V5RGV2KTtcbiAgICBpZiAoIXBsdWdpbldpbmRvd1NldHRpbmdzKSB7XG4gICAgICBhd2FpdCBmaWdtYS5jbGllbnRTdG9yYWdlLnNldEFzeW5jKHN0b3JhZ2VLZXlEZXYsIERFRkFVTFRfV0lORE9XX1NFVFRJTkdTLmRldik7XG4gICAgICBwbHVnaW5XaW5kb3dTZXR0aW5ncyA9IERFRkFVTFRfV0lORE9XX1NFVFRJTkdTLmRldjtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcGx1Z2luV2luZG93U2V0dGluZ3MgPSBhd2FpdCBmaWdtYS5jbGllbnRTdG9yYWdlLmdldEFzeW5jKHN0b3JhZ2VLZXlQcmV2aWV3KTtcbiAgICBpZiAoIXBsdWdpbldpbmRvd1NldHRpbmdzKSB7XG4gICAgICBhd2FpdCBmaWdtYS5jbGllbnRTdG9yYWdlLnNldEFzeW5jKHN0b3JhZ2VLZXlQcmV2aWV3LCBERUZBVUxUX1dJTkRPV19TRVRUSU5HUy5wcmV2aWV3KTtcbiAgICAgIHBsdWdpbldpbmRvd1NldHRpbmdzID0gREVGQVVMVF9XSU5ET1dfU0VUVElOR1MucHJldmlldztcbiAgICB9XG4gIH1cbiAgaWYgKG9wdGlvbnMgJiYgKCFvcHRpb25zLndpZHRoIHx8ICFvcHRpb25zLmhlaWdodCkpIHtcbiAgICBwbHVnaW5XaW5kb3dTZXR0aW5ncy5oZWlnaHQgPSAzMDA7XG4gICAgcGx1Z2luV2luZG93U2V0dGluZ3Mud2lkdGggPSA0MDA7XG4gICAgaWYgKHBsdWdpbldpbmRvd1NldHRpbmdzLnRvb2xiYXJFbmFibGVkKSB7XG4gICAgICBwbHVnaW5XaW5kb3dTZXR0aW5ncy5oZWlnaHQgKz0gVE9PTEJBUl9IRUlHSFQkMTtcbiAgICB9XG4gIH1cbiAgaWYgKCFwbHVnaW5XaW5kb3dTZXR0aW5ncyB8fCB0eXBlb2YgcGx1Z2luV2luZG93U2V0dGluZ3MgIT09IFwib2JqZWN0XCIpIHtcbiAgICByZXR1cm4gREVGQVVMVF9XSU5ET1dfU0VUVElOR1NbY29tbWFuZF07XG4gIH1cbiAgaWYgKHBsdWdpbldpbmRvd1NldHRpbmdzLnBvc2l0aW9uKSB7XG4gICAgY29uc3QgeyB4LCB5IH0gPSBwbHVnaW5XaW5kb3dTZXR0aW5ncy5wb3NpdGlvbjtcbiAgICBpZiAoIU51bWJlci5pc0ludGVnZXIoeCkgfHwgIU51bWJlci5pc0ludGVnZXIoeSkgfHwgeCA8IDAgfHwgeSA8IDApIHtcbiAgICAgIHBsdWdpbldpbmRvd1NldHRpbmdzLnBvc2l0aW9uID0geyB4OiAwLCB5OiAwIH07XG4gICAgfVxuICB9XG4gIHJldHVybiB7XG4gICAgLi4uREVGQVVMVF9XSU5ET1dfU0VUVElOR1NbY29tbWFuZF0sXG4gICAgLi4ucGx1Z2luV2luZG93U2V0dGluZ3NcbiAgfTtcbn1cblxuY29uc3QgVE9PTEJBUl9IRUlHSFQgPSA0MTtcbmFzeW5jIGZ1bmN0aW9uIHNhdmVXaW5kb3dTZXR0aW5ncyhzZXR0aW5ncykge1xuICBjb25zdCBjb21tYW5kID0gcnVudGltZURhdGEuY29tbWFuZDtcbiAgY29uc3Qgc3RvcmFnZUtleSA9IGNvbW1hbmQgPT09IFwiZGV2XCIgPyBcIlBMVUdNQV9QTFVHSU5fV0lORE9XX1NFVFRJTkdTX0RFVlwiIDogXCJQTFVHTUFfUExVR0lOX1dJTkRPV19TRVRUSU5HU19QUkVWSUVXXCI7XG4gIGF3YWl0IGZpZ21hLmNsaWVudFN0b3JhZ2Uuc2V0QXN5bmMoc3RvcmFnZUtleSwgc2V0dGluZ3MpO1xufVxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2F2ZVdpbmRvd1NldHRpbmdzKG1zZykge1xuICBnZXRXaW5kb3dTZXR0aW5ncygpLnRoZW4oKHBsdWdpbldpbmRvd1NldHRpbmdzKSA9PiB7XG4gICAgaWYgKG1zZy5kYXRhLmhlaWdodCkge1xuICAgICAgaWYgKG1zZy5kYXRhLnRvb2xiYXJFbmFibGVkKSB7XG4gICAgICAgIGZpZ21hQXBpLnJlc2l6ZShtc2cuZGF0YS53aWR0aCwgbXNnLmRhdGEuaGVpZ2h0ICsgVE9PTEJBUl9IRUlHSFQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmlnbWFBcGkucmVzaXplKG1zZy5kYXRhLndpZHRoLCBtc2cuZGF0YS5oZWlnaHQgLSBUT09MQkFSX0hFSUdIVCk7XG4gICAgICB9XG4gICAgICBsZXQgbWVyZ2VkT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24ocGx1Z2luV2luZG93U2V0dGluZ3MsIG1zZy5kYXRhKTtcbiAgICAgIHNhdmVXaW5kb3dTZXR0aW5ncyhtZXJnZWRPcHRpb25zKTtcbiAgICB9XG4gIH0pO1xufVxuaGFuZGxlU2F2ZVdpbmRvd1NldHRpbmdzLkVWRU5UX05BTUUgPSBcIlBMVUdNQV9TQVZFX1BMVUdJTl9XSU5ET1dfU0VUVElOR1NcIjtcblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlSGlkZVRvb2xiYXIoX21zZykge1xuICBpZiAoIWZpZ21hQXBpKSB0aHJvdyBuZXcgRXJyb3IoXCJGaWdtYSBBUEkgbm90IGF2YWlsYWJsZVwiKTtcbiAgY29uc3Qgc2V0dGluZ3MgPSBhd2FpdCBnZXRXaW5kb3dTZXR0aW5ncygpO1xuICBzZXR0aW5ncy50b29sYmFyRW5hYmxlZCA9IGZhbHNlO1xuICBmaWdtYUFwaS5yZXNpemUoc2V0dGluZ3Mud2lkdGgsIHNldHRpbmdzLmhlaWdodCk7XG4gIGF3YWl0IHNhdmVXaW5kb3dTZXR0aW5ncyhzZXR0aW5ncyk7XG59XG5oYW5kbGVIaWRlVG9vbGJhci5FVkVOVF9OQU1FID0gXCJQTFVHTUFfSElERV9UT09MQkFSXCI7XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZU1heGltaXplV2luZG93KF9tc2cpIHtcbiAgaWYgKCFmaWdtYUFwaSkgdGhyb3cgbmV3IEVycm9yKFwiRmlnbWEgQVBJIG5vdCBhdmFpbGFibGVcIik7XG4gIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgZ2V0V2luZG93U2V0dGluZ3MoKTtcbiAgc2V0dGluZ3MubWluaW1pemVkID0gZmFsc2U7XG4gIGNvbnN0IGhlaWdodCA9IHNldHRpbmdzLnRvb2xiYXJFbmFibGVkID8gc2V0dGluZ3MuaGVpZ2h0ICsgNDEgOiBzZXR0aW5ncy5oZWlnaHQ7XG4gIGZpZ21hQXBpLnJlc2l6ZShzZXR0aW5ncy53aWR0aCwgaGVpZ2h0KTtcbiAgYXdhaXQgc2F2ZVdpbmRvd1NldHRpbmdzKHNldHRpbmdzKTtcbn1cbmhhbmRsZU1heGltaXplV2luZG93LkVWRU5UX05BTUUgPSBcIlBMVUdNQV9NQVhJTUlaRV9XSU5ET1dcIjtcblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlTWluaW1pemVXaW5kb3coX21zZykge1xuICBpZiAoIWZpZ21hQXBpKSB0aHJvdyBuZXcgRXJyb3IoXCJGaWdtYSBBUEkgbm90IGF2YWlsYWJsZVwiKTtcbiAgY29uc3Qgc2V0dGluZ3MgPSBhd2FpdCBnZXRXaW5kb3dTZXR0aW5ncygpO1xuICBzZXR0aW5ncy5taW5pbWl6ZWQgPSB0cnVlO1xuICBmaWdtYUFwaS5yZXNpemUoMjAwLCA0MCk7XG4gIGF3YWl0IHNhdmVXaW5kb3dTZXR0aW5ncyhzZXR0aW5ncyk7XG59XG5oYW5kbGVNaW5pbWl6ZVdpbmRvdy5FVkVOVF9OQU1FID0gXCJQTFVHTUFfTUlOSU1JWkVfV0lORE9XXCI7XG5cbmNvbnN0IFdJTkRPV19TRVRUSU5HU19LRVkgPSBcIlBMVUdNQV9QTFVHSU5fV0lORE9XX1NFVFRJTkdTXCI7XG5cbmZ1bmN0aW9uIGN1c3RvbVJlc2l6ZSh3aWR0aCwgaGVpZ2h0KSB7XG4gIGNvbnNvbGUubG9nKFwiY3VzdG9tUmVzaXplXCIsIHdpZHRoLCBoZWlnaHQpO1xuICBnZXRXaW5kb3dTZXR0aW5ncygpLnRoZW4oKHBsdWdpbldpbmRvd1NldHRpbmdzKSA9PiB7XG4gICAgY29uc3QgZGltZW5zaW9ucyA9IHtcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0XG4gICAgfTtcbiAgICBpZiAocGx1Z2luV2luZG93U2V0dGluZ3MubWluaW1pemVkKSB7XG4gICAgICBkaW1lbnNpb25zLmhlaWdodCA9IDQwO1xuICAgICAgZGltZW5zaW9ucy53aWR0aCA9IDIwMDtcbiAgICB9XG4gICAgZmlnbWFBcGkucmVzaXplKGRpbWVuc2lvbnMud2lkdGgsIGRpbWVuc2lvbnMuaGVpZ2h0KTtcbiAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldENvbW1hbmRIaXN0b3J5KCkge1xuICBsZXQgY29tbWFuZEhpc3RvcnkgPSBhd2FpdCBmaWdtYS5jbGllbnRTdG9yYWdlLmdldEFzeW5jKFwiUExVR01BX0NPTU1BTkRfSElTVE9SWVwiKTtcbiAgaWYgKCFjb21tYW5kSGlzdG9yeSkge1xuICAgIGNvbW1hbmRIaXN0b3J5ID0ge1xuICAgICAgcHJldmlvdXNDb21tYW5kOiBudWxsLFxuICAgICAgcHJldmlvdXNJbnN0YW5jZUlkOiBudWxsXG4gICAgfTtcbiAgfVxuICBjb25zdCBwcmV2aW91c0NvbW1hbmQgPSBjb21tYW5kSGlzdG9yeS5wcmV2aW91c0NvbW1hbmQ7XG4gIGNvbnN0IHByZXZpb3VzSW5zdGFuY2VJZCA9IGNvbW1hbmRIaXN0b3J5LnByZXZpb3VzSW5zdGFuY2VJZDtcbiAgY29tbWFuZEhpc3RvcnkucHJldmlvdXNDb21tYW5kID0gcnVudGltZURhdGEuY29tbWFuZCA/PyBudWxsO1xuICBjb21tYW5kSGlzdG9yeS5wcmV2aW91c0luc3RhbmNlSWQgPSBydW50aW1lRGF0YS5pbnN0YW5jZUlkO1xuICBhd2FpdCBmaWdtYS5jbGllbnRTdG9yYWdlLnNldEFzeW5jKFwiUExVR01BX0NPTU1BTkRfSElTVE9SWVwiLCBjb21tYW5kSGlzdG9yeSk7XG4gIHJldHVybiB7IHByZXZpb3VzQ29tbWFuZCwgcHJldmlvdXNJbnN0YW5jZUlkIH07XG59XG5cbmZ1bmN0aW9uIGN1c3RvbVNob3dVSShodG1sU3RyaW5nLCBpbml0aWFsT3B0aW9ucykge1xuICBjb25zdCBvcHRpb25zID0geyAuLi5pbml0aWFsT3B0aW9ucyB9O1xuICBjb25zdCBtZXJnZWRPcHRpb25zID0geyB2aXNpYmxlOiBmYWxzZSwgLi4ub3B0aW9ucyB9O1xuICBmaWdtYUFwaS5zaG93VUkoaHRtbFN0cmluZywgbWVyZ2VkT3B0aW9ucyk7XG4gIGdldENvbW1hbmRIaXN0b3J5KCkudGhlbigoY29tbWFuZEhpc3RvcnkpID0+IHtcbiAgICBnZXRXaW5kb3dTZXR0aW5ncyhERUZBVUxUX1dJTkRPV19TRVRUSU5HU1tcImRldlwiXSkudGhlbigocGx1Z2luV2luZG93U2V0dGluZ3MpID0+IHtcbiAgICAgIGNvbnN0IGhhc0NvbW1hbmRDaGFuZ2VkID0gY29tbWFuZEhpc3RvcnkucHJldmlvdXNDb21tYW5kICE9PSBydW50aW1lRGF0YS5jb21tYW5kO1xuICAgICAgY29uc3QgaGFzSW5zdGFuY2VDaGFuZ2VkID0gY29tbWFuZEhpc3RvcnkucHJldmlvdXNJbnN0YW5jZUlkICE9PSBydW50aW1lRGF0YS5pbnN0YW5jZUlkO1xuICAgICAgaWYgKHJ1bnRpbWVEYXRhLmNvbW1hbmQgPT09IFwicHJldmlld1wiKSB7XG4gICAgICAgIHBsdWdpbldpbmRvd1NldHRpbmdzLm1pbmltaXplZCA9IHRydWU7XG4gICAgICAgIHBsdWdpbldpbmRvd1NldHRpbmdzLnRvb2xiYXJFbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgY29uc3Qgem9vbSA9IGZpZ21hLnZpZXdwb3J0Lnpvb207XG4gICAgICAgIG9wdGlvbnMucG9zaXRpb24gPSB7XG4gICAgICAgICAgeDogZmlnbWEudmlld3BvcnQuYm91bmRzLnggKyAxMiAvIHpvb20sXG4gICAgICAgICAgeTogZmlnbWEudmlld3BvcnQuYm91bmRzLnkgKyAoZmlnbWEudmlld3BvcnQuYm91bmRzLmhlaWdodCAtICg4MCArIDEyKSAvIHpvb20pXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAoaGFzQ29tbWFuZENoYW5nZWQgJiYgcnVudGltZURhdGEuY29tbWFuZCA9PT0gXCJkZXZcIikge1xuICAgICAgICBjb25zdCB6b29tID0gZmlnbWEudmlld3BvcnQuem9vbTtcbiAgICAgICAgaWYgKCFvcHRpb25zLnBvc2l0aW9uKSB7XG4gICAgICAgICAgb3B0aW9ucy5wb3NpdGlvbiA9IHtcbiAgICAgICAgICAgIHg6IGZpZ21hLnZpZXdwb3J0LmNlbnRlci54IC0gKG9wdGlvbnMud2lkdGggfHwgMzAwKSAvIDIgLyB6b29tLFxuICAgICAgICAgICAgeTogZmlnbWEudmlld3BvcnQuY2VudGVyLnkgLSAoKG9wdGlvbnMuaGVpZ2h0IHx8IDIwMCkgKyA0MSkgLyAyIC8gem9vbVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChoYXNJbnN0YW5jZUNoYW5nZWQgJiYgcnVudGltZURhdGEuY29tbWFuZCA9PT0gXCJwcmV2aWV3XCIpIHtcbiAgICAgICAgcGx1Z2luV2luZG93U2V0dGluZ3MudG9vbGJhckVuYWJsZWQgPSB0cnVlO1xuICAgICAgICBwbHVnaW5XaW5kb3dTZXR0aW5ncy5taW5pbWl6ZWQgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKG9wdGlvbnMuaGVpZ2h0KSB7XG4gICAgICAgIHBsdWdpbldpbmRvd1NldHRpbmdzLmhlaWdodCA9IG9wdGlvbnMuaGVpZ2h0O1xuICAgICAgfVxuICAgICAgaWYgKG9wdGlvbnMud2lkdGgpIHtcbiAgICAgICAgcGx1Z2luV2luZG93U2V0dGluZ3Mud2lkdGggPSBvcHRpb25zLndpZHRoO1xuICAgICAgfVxuICAgICAgaWYgKHBsdWdpbldpbmRvd1NldHRpbmdzLnRvb2xiYXJFbmFibGVkICYmIG9wdGlvbnMuaGVpZ2h0KSB7XG4gICAgICAgIG9wdGlvbnMuaGVpZ2h0ICs9IDQxO1xuICAgICAgfVxuICAgICAgaWYgKHBsdWdpbldpbmRvd1NldHRpbmdzLm1pbmltaXplZCkge1xuICAgICAgICBvcHRpb25zLmhlaWdodCA9IDQwO1xuICAgICAgICBvcHRpb25zLndpZHRoID0gMjAwO1xuICAgICAgfVxuICAgICAgaWYgKG9wdGlvbnMud2lkdGggJiYgb3B0aW9ucy5oZWlnaHQpIHtcbiAgICAgICAgZmlnbWFBcGkucmVzaXplKG9wdGlvbnMud2lkdGgsIG9wdGlvbnMuaGVpZ2h0KTtcbiAgICAgIH0gZWxzZSBpZiAocGx1Z2luV2luZG93U2V0dGluZ3MudG9vbGJhckVuYWJsZWQpIHtcbiAgICAgICAgZmlnbWFBcGkucmVzaXplKDMwMCwgMjQxKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZpZ21hQXBpLnJlc2l6ZSgzMDAsIDIwMCk7XG4gICAgICB9XG4gICAgICBpZiAob3B0aW9ucy5wb3NpdGlvbj8ueCAhPSBudWxsICYmIG9wdGlvbnMucG9zaXRpb24/LnkgIT0gbnVsbCkge1xuICAgICAgICBmaWdtYUFwaS5yZXBvc2l0aW9uKG9wdGlvbnMucG9zaXRpb24ueCwgb3B0aW9ucy5wb3NpdGlvbi55KTtcbiAgICAgIH1cbiAgICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgZXZlbnQ6IFwiUExVR01BX1BMVUdJTl9XSU5ET1dfU0VUVElOR1NcIixcbiAgICAgICAgZGF0YTogcGx1Z2luV2luZG93U2V0dGluZ3NcbiAgICAgIH0pO1xuICAgICAgaWYgKG9wdGlvbnMudmlzaWJsZSAhPT0gZmFsc2UpIHtcbiAgICAgICAgZmlnbWEudWkuc2hvdygpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cblxuY29uc3Qgd2luZG93SGFuZGxlcnMgPSB7XG4gIFtoYW5kbGVNaW5pbWl6ZVdpbmRvdy5FVkVOVF9OQU1FXTogaGFuZGxlTWluaW1pemVXaW5kb3csXG4gIFtoYW5kbGVNYXhpbWl6ZVdpbmRvdy5FVkVOVF9OQU1FXTogaGFuZGxlTWF4aW1pemVXaW5kb3csXG4gIFtoYW5kbGVIaWRlVG9vbGJhci5FVkVOVF9OQU1FXTogaGFuZGxlSGlkZVRvb2xiYXIsXG4gIFtoYW5kbGVTYXZlV2luZG93U2V0dGluZ3MuRVZFTlRfTkFNRV06IGhhbmRsZVNhdmVXaW5kb3dTZXR0aW5ncyxcbiAgW2hhbmRsZURlbGV0ZVJvb3RQbHVnaW5EYXRhLkVWRU5UX05BTUVdOiBoYW5kbGVEZWxldGVSb290UGx1Z2luRGF0YSxcbiAgW2hhbmRsZURlbGV0ZUNsaWVudFN0b3JhZ2UuRVZFTlRfTkFNRV06IGhhbmRsZURlbGV0ZUNsaWVudFN0b3JhZ2Vcbn07XG5maWdtYS51aS5vbihcIm1lc3NhZ2VcIiwgYXN5bmMgKG1zZykgPT4ge1xuICBjb25zdCBoYW5kbGVyID0gd2luZG93SGFuZGxlcnNbbXNnLmV2ZW50XTtcbiAgaWYgKGhhbmRsZXIpIHtcbiAgICBhd2FpdCBQcm9taXNlLnJlc29sdmUoaGFuZGxlcihtc2cpKTtcbiAgfVxufSk7XG5cbmV4cG9ydCB7IFdJTkRPV19TRVRUSU5HU19LRVksIGN1c3RvbVJlc2l6ZSwgY3VzdG9tU2hvd1VJLCBmaWdtYUFwaSB9O1xuIiwiaW50ZXJmYWNlIE9wdGlvbnMge1xuICAgIGluY2x1ZGU/OiBzdHJpbmdbXVxuICAgIGV4Y2x1ZGU/OiBzdHJpbmdbXVxufVxuXG5jb25zdCBub2RlUHJvcHM6IHN0cmluZ1tdID0gW1xuICAgICdpZCcsXG4gICAgJ3BhcmVudCcsXG4gICAgJ25hbWUnLFxuICAgICdyZW1vdmVkJyxcbiAgICAndmlzaWJsZScsXG4gICAgJ2xvY2tlZCcsXG4gICAgJ2NoaWxkcmVuJyxcbiAgICAnY29uc3RyYWludHMnLFxuICAgICdhYnNvbHV0ZVRyYW5zZm9ybScsXG4gICAgJ3JlbGF0aXZlVHJhbnNmb3JtJyxcbiAgICAneCcsXG4gICAgJ3knLFxuICAgICdyb3RhdGlvbicsXG4gICAgJ3dpZHRoJyxcbiAgICAnaGVpZ2h0JyxcbiAgICAnY29uc3RyYWluUHJvcG9ydGlvbnMnLFxuICAgICdsYXlvdXRBbGlnbicsXG4gICAgJ2xheW91dEdyb3cnLFxuICAgICdvcGFjaXR5JyxcbiAgICAnYmxlbmRNb2RlJyxcbiAgICAnaXNNYXNrJyxcbiAgICAnZWZmZWN0cycsXG4gICAgJ2VmZmVjdFN0eWxlSWQnLFxuICAgICdleHBhbmRlZCcsXG4gICAgJ2JhY2tncm91bmRzJyxcbiAgICAnYmFja2dyb3VuZFN0eWxlSWQnLFxuICAgICdmaWxscycsXG4gICAgJ3N0cm9rZXMnLFxuICAgICdzdHJva2VXZWlnaHQnLFxuICAgICdzdHJva2VNaXRlckxpbWl0JyxcbiAgICAnc3Ryb2tlQWxpZ24nLFxuICAgICdzdHJva2VDYXAnLFxuICAgICdzdHJva2VKb2luJyxcbiAgICAnZGFzaFBhdHRlcm4nLFxuICAgICdmaWxsU3R5bGVJZCcsXG4gICAgJ3N0cm9rZVN0eWxlSWQnLFxuICAgICdjb3JuZXJSYWRpdXMnLFxuICAgICdjb3JuZXJTbW9vdGhpbmcnLFxuICAgICd0b3BMZWZ0UmFkaXVzJyxcbiAgICAndG9wUmlnaHRSYWRpdXMnLFxuICAgICdib3R0b21MZWZ0UmFkaXVzJyxcbiAgICAnYm90dG9tUmlnaHRSYWRpdXMnLFxuICAgICdleHBvcnRTZXR0aW5ncycsXG4gICAgJ292ZXJmbG93RGlyZWN0aW9uJyxcbiAgICAnbnVtYmVyT2ZGaXhlZENoaWxkcmVuJyxcbiAgICAnb3ZlcmxheVBvc2l0aW9uVHlwZScsXG4gICAgJ292ZXJsYXlCYWNrZ3JvdW5kJyxcbiAgICAnb3ZlcmxheUJhY2tncm91bmRJbnRlcmFjdGlvbicsXG4gICAgJ3JlYWN0aW9ucycsXG4gICAgJ2Rlc2NyaXB0aW9uJyxcbiAgICAncmVtb3RlJyxcbiAgICAna2V5JyxcbiAgICAnbGF5b3V0TW9kZScsXG4gICAgJ3ByaW1hcnlBeGlzU2l6aW5nTW9kZScsXG4gICAgJ2NvdW50ZXJBeGlzU2l6aW5nTW9kZScsXG4gICAgJ3ByaW1hcnlBeGlzQWxpZ25JdGVtcycsXG4gICAgJ2NvdW50ZXJBeGlzQWxpZ25JdGVtcycsXG4gICAgJ3BhZGRpbmdMZWZ0JyxcbiAgICAncGFkZGluZ1JpZ2h0JyxcbiAgICAncGFkZGluZ1RvcCcsXG4gICAgJ3BhZGRpbmdCb3R0b20nLFxuICAgICdpdGVtU3BhY2luZycsXG4gICAgLy8gJ2hvcml6b250YWxQYWRkaW5nJyxcbiAgICAvLyAndmVydGljYWxQYWRkaW5nJyxcbiAgICAnbGF5b3V0R3JpZHMnLFxuICAgICdncmlkU3R5bGVJZCcsXG4gICAgJ2NsaXBzQ29udGVudCcsXG4gICAgJ2d1aWRlcydcbl1cblxuY29uc3QgcmVhZG9ubHk6IHN0cmluZ1tdID0gW1xuICAgICdpZCcsXG4gICAgJ3BhcmVudCcsXG4gICAgJ3JlbW92ZWQnLFxuICAgICdjaGlsZHJlbicsXG4gICAgJ2Fic29sdXRlVHJhbnNmb3JtJyxcbiAgICAnd2lkdGgnLFxuICAgICdoZWlnaHQnLFxuICAgICdvdmVybGF5UG9zaXRpb25UeXBlJyxcbiAgICAnb3ZlcmxheUJhY2tncm91bmQnLFxuICAgICdvdmVybGF5QmFja2dyb3VuZEludGVyYWN0aW9uJyxcbiAgICAncmVhY3Rpb25zJyxcbiAgICAncmVtb3RlJyxcbiAgICAna2V5JyxcbiAgICAndHlwZSdcbl1cblxuY29uc3QgaW5zdGFuY2VQcm9wczogc3RyaW5nW10gPSBbXG4gICAgJ3JvdGF0aW9uJyxcbiAgICAnY29uc3RyYWluUHJvcG9ydGlvbnMnXG5dXG5cbmNvbnN0IGRlZmF1bHRzOiBzdHJpbmdbXSA9IFtcbiAgICAnbmFtZScsXG4gICAgJ2d1aWRlcycsXG4gICAgJ2Rlc2NyaXB0aW9uJyxcbiAgICAncmVtb3RlJyxcbiAgICAna2V5JyxcbiAgICAncmVhY3Rpb25zJyxcbiAgICAneCcsXG4gICAgJ3knLFxuICAgICdleHBvcnRTZXR0aW5ncycsXG4gICAgJ2V4cGFuZGVkJyxcbiAgICAnaXNNYXNrJyxcbiAgICAnZXhwb3J0U2V0dGluZ3MnLFxuICAgICdvdmVyZmxvd0RpcmVjdGlvbicsXG4gICAgJ251bWJlck9mRml4ZWRDaGlsZHJlbicsXG4gICAgJ2NvbnN0cmFpbnRzJyxcbiAgICAncmVsYXRpdmVUcmFuc2Zvcm0nXG5dXG5cblxuXG5mdW5jdGlvbiBjbG9uZSh2YWwpIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh2YWwpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9kZVJlbW92ZWRCeVVzZXIobm9kZSkge1xuXG4gICAgaWYgKG5vZGUpIHtcbiAgICAgICAgaWYgKG5vZGUucGFyZW50ID09PSBudWxsIHx8IG5vZGUucGFyZW50LnBhcmVudCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFnZUlkKG5vZGUpIHtcbiAgICBpZiAobm9kZS5wYXJlbnQudHlwZSA9PT0gXCJQQUdFXCIpIHtcbiAgICAgICAgcmV0dXJuIG5vZGUucGFyZW50LmlkXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gcGFnZUlkKG5vZGUucGFyZW50KVxuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNlbnRlckluVmlld3BvcnQobm9kZSkge1xuICAgIC8vIFBvc2l0aW9uIG5ld2x5IGNyZWF0ZWQgdGFibGUgaW4gY2VudGVyIG9mIHZpZXdwb3J0XG4gICAgbm9kZS54ID0gZmlnbWEudmlld3BvcnQuY2VudGVyLnggLSAobm9kZS53aWR0aCAvIDIpXG4gICAgbm9kZS55ID0gZmlnbWEudmlld3BvcnQuY2VudGVyLnkgLSAobm9kZS5oZWlnaHQgLyAyKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc29ydE5vZGVzQnlQb3NpdGlvbihub2Rlcykge1xuXG4gICAgdmFyIHJlc3VsdCA9IG5vZGVzLm1hcCgoeCkgPT4geClcblxuICAgIHJlc3VsdC5zb3J0KChjdXJyZW50LCBuZXh0KSA9PiBjdXJyZW50LnggLSBuZXh0LngpXG5cbiAgICByZXR1cm4gcmVzdWx0LnNvcnQoKGN1cnJlbnQsIG5leHQpID0+IGN1cnJlbnQueSAtIG5leHQueSk7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuXG4vKipcclxuICogSGVscGVycyB3aGljaCBtYWtlIGl0IGVhc2llciB0byB1cGRhdGUgY2xpZW50IHN0b3JhZ2VcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGdldENsaWVudFN0b3JhZ2VBc3luYyhrZXkpIHtcclxuICAgIHJldHVybiBhd2FpdCBmaWdtYS5jbGllbnRTdG9yYWdlLmdldEFzeW5jKGtleSk7XHJcbn1cclxuZnVuY3Rpb24gc2V0Q2xpZW50U3RvcmFnZUFzeW5jKGtleSwgZGF0YSkge1xyXG4gICAgcmV0dXJuIGZpZ21hLmNsaWVudFN0b3JhZ2Uuc2V0QXN5bmMoa2V5LCBkYXRhKTtcclxufVxyXG5hc3luYyBmdW5jdGlvbiB1cGRhdGVDbGllbnRTdG9yYWdlQXN5bmMoa2V5LCBjYWxsYmFjaykge1xyXG4gICAgdmFyIGRhdGEgPSBhd2FpdCBmaWdtYS5jbGllbnRTdG9yYWdlLmdldEFzeW5jKGtleSk7XHJcbiAgICBkYXRhID0gY2FsbGJhY2soZGF0YSk7XHJcbiAgICAvLyBXaGF0IHNob3VsZCBoYXBwZW4gaWYgdXNlciBkb2Vzbid0IHJldHVybiBhbnl0aGluZyBpbiBjYWxsYmFjaz9cclxuICAgIGlmICghZGF0YSkge1xyXG4gICAgICAgIGRhdGEgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgZmlnbWEuY2xpZW50U3RvcmFnZS5zZXRBc3luYyhrZXksIGRhdGEpO1xyXG4gICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgfVxyXG59XG5cbmNvbnN0IGV2ZW50TGlzdGVuZXJzID0gW107XHJcbi8qKlxyXG4gKiBTZW5kIGFuIGV2ZW50IHRvIHRoZSBVSVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gYWN0aW9uIE5hbWUgb2YgdGhlIGV2ZW50XHJcbiAqIEBwYXJhbSB7YW55fSBkYXRhIERhdGEgdG8gc2VuZCB0byB0aGUgVUlcclxuICovXHJcbmNvbnN0IGRpc3BhdGNoRXZlbnQgPSAoYWN0aW9uLCBkYXRhKSA9PiB7XHJcbiAgICBmaWdtYS51aS5wb3N0TWVzc2FnZSh7IGFjdGlvbiwgZGF0YSB9KTtcclxufTtcclxuLyoqXHJcbiAqIEhhbmRsZSBhbiBldmVudCBmcm9tIHRoZSBVSVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gYWN0aW9uIE5hbWUgb2YgdGhlIGV2ZW50XHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIEZ1bmN0aW9uIHRvIHJ1biBvbiBldmVudFxyXG4gKi9cclxuY29uc3QgaGFuZGxlRXZlbnQgPSAoYWN0aW9uLCBjYWxsYmFjaykgPT4ge1xyXG4gICAgZXZlbnRMaXN0ZW5lcnMucHVzaCh7IGFjdGlvbiwgY2FsbGJhY2sgfSk7XHJcbn07XHJcbmZpZ21hLnVpLm9ubWVzc2FnZSA9IG1lc3NhZ2UgPT4ge1xyXG4gICAgZm9yIChsZXQgZXZlbnRMaXN0ZW5lciBvZiBldmVudExpc3RlbmVycykge1xyXG4gICAgICAgIGlmIChtZXNzYWdlLmFjdGlvbiA9PT0gZXZlbnRMaXN0ZW5lci5hY3Rpb24pXHJcbiAgICAgICAgICAgIGV2ZW50TGlzdGVuZXIuY2FsbGJhY2sobWVzc2FnZS5kYXRhKTtcclxuICAgIH1cclxufTtcblxuZnVuY3Rpb24gaXNPYmpMaXRlcmFsKF9vYmopIHtcclxuICAgIHZhciBfdGVzdCA9IF9vYmo7XHJcbiAgICByZXR1cm4gdHlwZW9mIF9vYmogIT09IFwib2JqZWN0XCIgfHwgX29iaiA9PT0gbnVsbFxyXG4gICAgICAgID8gZmFsc2VcclxuICAgICAgICA6IChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHdoaWxlICghZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIGlmIChPYmplY3QuZ2V0UHJvdG90eXBlT2YoKF90ZXN0ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKF90ZXN0KSkpID09PVxyXG4gICAgICAgICAgICAgICAgICAgIG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmdldFByb3RvdHlwZU9mKF9vYmopID09PSBfdGVzdDtcclxuICAgICAgICB9KSgpO1xyXG59XHJcbmNvbnN0IG5vZGVQcm9wcyA9IFtcclxuICAgIFwiaWRcIixcclxuICAgIFwicGFyZW50XCIsXHJcbiAgICBcIm5hbWVcIixcclxuICAgIFwicmVtb3ZlZFwiLFxyXG4gICAgXCJ2aXNpYmxlXCIsXHJcbiAgICBcImxvY2tlZFwiLFxyXG4gICAgXCJjaGlsZHJlblwiLFxyXG4gICAgXCJjb25zdHJhaW50c1wiLFxyXG4gICAgXCJhYnNvbHV0ZVRyYW5zZm9ybVwiLFxyXG4gICAgXCJyZWxhdGl2ZVRyYW5zZm9ybVwiLFxyXG4gICAgXCJ4XCIsXHJcbiAgICBcInlcIixcclxuICAgIFwicm90YXRpb25cIixcclxuICAgIFwid2lkdGhcIixcclxuICAgIFwiaGVpZ2h0XCIsXHJcbiAgICBcImNvbnN0cmFpblByb3BvcnRpb25zXCIsXHJcbiAgICBcImxheW91dEFsaWduXCIsXHJcbiAgICBcImxheW91dEdyb3dcIixcclxuICAgIFwib3BhY2l0eVwiLFxyXG4gICAgXCJibGVuZE1vZGVcIixcclxuICAgIFwiaXNNYXNrXCIsXHJcbiAgICBcImVmZmVjdHNcIixcclxuICAgIFwiZWZmZWN0U3R5bGVJZFwiLFxyXG4gICAgXCJleHBhbmRlZFwiLFxyXG4gICAgXCJiYWNrZ3JvdW5kc1wiLFxyXG4gICAgXCJiYWNrZ3JvdW5kU3R5bGVJZFwiLFxyXG4gICAgXCJmaWxsc1wiLFxyXG4gICAgXCJzdHJva2VzXCIsXHJcbiAgICBcInN0cm9rZVdlaWdodFwiLFxyXG4gICAgXCJzdHJva2VNaXRlckxpbWl0XCIsXHJcbiAgICBcInN0cm9rZUFsaWduXCIsXHJcbiAgICBcInN0cm9rZUNhcFwiLFxyXG4gICAgXCJzdHJva2VKb2luXCIsXHJcbiAgICBcImRhc2hQYXR0ZXJuXCIsXHJcbiAgICBcImZpbGxTdHlsZUlkXCIsXHJcbiAgICBcInN0cm9rZVN0eWxlSWRcIixcclxuICAgIFwiY29ybmVyUmFkaXVzXCIsXHJcbiAgICBcImNvcm5lclNtb290aGluZ1wiLFxyXG4gICAgXCJ0b3BMZWZ0UmFkaXVzXCIsXHJcbiAgICBcInRvcFJpZ2h0UmFkaXVzXCIsXHJcbiAgICBcImJvdHRvbUxlZnRSYWRpdXNcIixcclxuICAgIFwiYm90dG9tUmlnaHRSYWRpdXNcIixcclxuICAgIFwiZXhwb3J0U2V0dGluZ3NcIixcclxuICAgIFwib3ZlcmZsb3dEaXJlY3Rpb25cIixcclxuICAgIFwibnVtYmVyT2ZGaXhlZENoaWxkcmVuXCIsXHJcbiAgICBcIm92ZXJsYXlQb3NpdGlvblR5cGVcIixcclxuICAgIFwib3ZlcmxheUJhY2tncm91bmRcIixcclxuICAgIFwib3ZlcmxheUJhY2tncm91bmRJbnRlcmFjdGlvblwiLFxyXG4gICAgXCJyZWFjdGlvbnNcIixcclxuICAgIFwiZGVzY3JpcHRpb25cIixcclxuICAgIFwicmVtb3RlXCIsXHJcbiAgICBcImtleVwiLFxyXG4gICAgXCJsYXlvdXRNb2RlXCIsXHJcbiAgICBcInByaW1hcnlBeGlzU2l6aW5nTW9kZVwiLFxyXG4gICAgXCJjb3VudGVyQXhpc1NpemluZ01vZGVcIixcclxuICAgIFwicHJpbWFyeUF4aXNBbGlnbkl0ZW1zXCIsXHJcbiAgICBcImNvdW50ZXJBeGlzQWxpZ25JdGVtc1wiLFxyXG4gICAgXCJwYWRkaW5nTGVmdFwiLFxyXG4gICAgXCJwYWRkaW5nUmlnaHRcIixcclxuICAgIFwicGFkZGluZ1RvcFwiLFxyXG4gICAgXCJwYWRkaW5nQm90dG9tXCIsXHJcbiAgICBcIml0ZW1TcGFjaW5nXCIsXHJcbiAgICAvLyAnaG9yaXpvbnRhbFBhZGRpbmcnLFxyXG4gICAgLy8gJ3ZlcnRpY2FsUGFkZGluZycsXHJcbiAgICBcImxheW91dEdyaWRzXCIsXHJcbiAgICBcImdyaWRTdHlsZUlkXCIsXHJcbiAgICBcImNsaXBzQ29udGVudFwiLFxyXG4gICAgXCJndWlkZXNcIixcclxuICAgIFwidHlwZVwiLFxyXG4gICAgXCJzdHJva2VUb3BXZWlnaHRcIixcclxuICAgIFwic3Ryb2tlQm90dG9tV2VpZ2h0XCIsXHJcbiAgICBcInN0cm9rZVJpZ2h0V2VpZ2h0XCIsXHJcbiAgICBcInN0cm9rZUxlZnRXZWlnaHRcIixcclxuXTtcclxuY29uc3QgcmVhZE9ubHkgPSBbXHJcbiAgICBcImlkXCIsXHJcbiAgICBcInBhcmVudFwiLFxyXG4gICAgXCJyZW1vdmVkXCIsXHJcbiAgICBcImNoaWxkcmVuXCIsXHJcbiAgICBcImFic29sdXRlVHJhbnNmb3JtXCIsXHJcbiAgICBcIndpZHRoXCIsXHJcbiAgICBcImhlaWdodFwiLFxyXG4gICAgXCJvdmVybGF5UG9zaXRpb25UeXBlXCIsXHJcbiAgICBcIm92ZXJsYXlCYWNrZ3JvdW5kXCIsXHJcbiAgICBcIm92ZXJsYXlCYWNrZ3JvdW5kSW50ZXJhY3Rpb25cIixcclxuICAgIFwicmVhY3Rpb25zXCIsXHJcbiAgICBcInJlbW90ZVwiLFxyXG4gICAgXCJrZXlcIixcclxuICAgIFwidHlwZVwiLFxyXG4gICAgXCJtYXN0ZXJDb21wb25lbnRcIixcclxuICAgIFwibWFpbkNvbXBvbmVudFwiLFxyXG5dO1xyXG4vLyBleHBvcnQgZnVuY3Rpb24gY29weVBhc3RlKHNvdXJjZToge30gfCBCYXNlTm9kZSwgdGFyZ2V0OiB7fSB8IEJhc2VOb2RlKVxyXG4vLyBleHBvcnQgZnVuY3Rpb24gY29weVBhc3RlKHNvdXJjZToge30gfCBCYXNlTm9kZSwgdGFyZ2V0OiB7fSB8IEJhc2VOb2RlLCBvcHRpb25zOiBPcHRpb25zKVxyXG4vLyBleHBvcnQgZnVuY3Rpb24gY29weVBhc3RlKHNvdXJjZToge30gfCBCYXNlTm9kZSwgdGFyZ2V0OiB7fSB8IEJhc2VOb2RlLCBjYWxsYmFjazogQ2FsbGJhY2spXHJcbi8vIGV4cG9ydCBmdW5jdGlvbiBjb3B5UGFzdGUoc291cmNlOiB7fSB8IEJhc2VOb2RlLCB0YXJnZXQ6IHt9IHwgQmFzZU5vZGUsIG9wdGlvbnM6IE9wdGlvbnMsIGNhbGxiYWNrOiBDYWxsYmFjaylcclxuLy8gZXhwb3J0IGZ1bmN0aW9uIGNvcHlQYXN0ZShzb3VyY2U6IHt9IHwgQmFzZU5vZGUsIHRhcmdldDoge30gfCBCYXNlTm9kZSwgY2FsbGJhY2s6IENhbGxiYWNrLCBvcHRpb25zOiBPcHRpb25zKVxyXG4vKipcclxuICogQWxsb3dzIHlvdSB0byBjb3B5IGFuZCBwYXN0ZSBwcm9wcyBiZXR3ZWVuIG5vZGVzLlxyXG4gKlxyXG4gKiBAcGFyYW0gc291cmNlIC0gVGhlIG5vZGUgeW91IHdhbnQgdG8gY29weSBmcm9tXHJcbiAqIEBwYXJhbSB0YXJnZXQgLSBUaGUgbm9kZSBvciBvYmplY3QgeW91IHdhbnQgdG8gcGFzdGUgdG9cclxuICogQHBhcmFtIGFyZ3MgLSBFaXRoZXIgb3B0aW9ucyBvciBhIGNhbGxiYWNrLlxyXG4gKiBAcmV0dXJucyBBIG5vZGUgb3Igb2JqZWN0IHdpdGggdGhlIHByb3BlcnRpZXMgY29waWVkIG92ZXJcclxuICovXHJcbi8vIEZJWE1FOiBXaGVuIGFuIGVtcHR5IG9iamV0IGlzIHByb3ZpZGVkLCBjb3B5IG92ZXIgYWxsIHByb3BlcnRpZXMgaW5jbHVkaW5nIHdpZHRoIGFuZCBoZWlnaHRcclxuLy8gRklYTUU6IERvbid0IHJlcXVpcmUgYSBzZXR0ZXIgaW4gb3JkZXIgdG8gY29weSBwcm9wZXJ0eS4gU2hvdWxkIGJlIGFibGUgdG8gY29weSBmcm9tIGFuIG9iamVjdCBsaXRlcmFsIGZvciBleGFtcGxlLlxyXG5mdW5jdGlvbiBjb3B5UGFzdGUoc291cmNlLCB0YXJnZXQsIC4uLmFyZ3MpIHtcclxuICAgIHZhciB0YXJnZXRJc0VtcHR5O1xyXG4gICAgaWYgKHRhcmdldCAmJlxyXG4gICAgICAgIE9iamVjdC5rZXlzKHRhcmdldCkubGVuZ3RoID09PSAwICYmXHJcbiAgICAgICAgdGFyZ2V0LmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHtcclxuICAgICAgICB0YXJnZXRJc0VtcHR5ID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIHZhciBvcHRpb25zO1xyXG4gICAgaWYgKHR5cGVvZiBhcmdzWzBdID09PSBcImZ1bmN0aW9uXCIpXHJcbiAgICAgICAgYXJnc1swXTtcclxuICAgIGlmICh0eXBlb2YgYXJnc1sxXSA9PT0gXCJmdW5jdGlvblwiKVxyXG4gICAgICAgIGFyZ3NbMV07XHJcbiAgICBpZiAodHlwZW9mIGFyZ3NbMF0gPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIGFyZ3NbMF0gIT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICBvcHRpb25zID0gYXJnc1swXTtcclxuICAgIGlmICh0eXBlb2YgYXJnc1swXSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgYXJnc1swXSAhPT0gXCJmdW5jdGlvblwiKVxyXG4gICAgICAgIG9wdGlvbnMgPSBhcmdzWzBdO1xyXG4gICAgaWYgKCFvcHRpb25zKVxyXG4gICAgICAgIG9wdGlvbnMgPSB7fTtcclxuICAgIGNvbnN0IHsgaW5jbHVkZSwgZXhjbHVkZSwgd2l0aG91dFJlbGF0aW9ucywgcmVtb3ZlQ29uZmxpY3RzIH0gPSBvcHRpb25zO1xyXG4gICAgLy8gY29uc3QgcHJvcHMgPSBPYmplY3QuZW50cmllcyhPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzb3VyY2UuX19wcm90b19fKSlcclxuICAgIGxldCBhbGxvd2xpc3QgPSBub2RlUHJvcHMuZmlsdGVyKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICAgIHJldHVybiAhcmVhZE9ubHkuaW5jbHVkZXMoZWwpO1xyXG4gICAgfSk7XHJcbiAgICBpZiAoaW5jbHVkZSkge1xyXG4gICAgICAgIC8vIElmIGluY2x1ZGUgc3VwcGxpZWQsIGluY2x1ZGUgY29weSBhY3Jvc3MgdGhlc2UgcHJvcGVydGllcyBhbmQgdGhlaXIgdmFsdWVzIGlmIHRoZXkgZXhpc3RcclxuICAgICAgICBhbGxvd2xpc3QgPSBpbmNsdWRlLmZpbHRlcihmdW5jdGlvbiAoZWwpIHtcclxuICAgICAgICAgICAgcmV0dXJuICFyZWFkT25seS5pbmNsdWRlcyhlbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBpZiAoZXhjbHVkZSkge1xyXG4gICAgICAgIC8vIElmIGV4Y2x1ZGUgc3VwcGxpZWQgdGhlbiBkb24ndCBjb3B5IG92ZXIgdGhlIHZhbHVlcyBvZiB0aGVzZSBwcm9wZXJ0aWVzXHJcbiAgICAgICAgYWxsb3dsaXN0ID0gYWxsb3dsaXN0LmZpbHRlcihmdW5jdGlvbiAoZWwpIHtcclxuICAgICAgICAgICAgcmV0dXJuICFleGNsdWRlLmNvbmNhdChyZWFkT25seSkuaW5jbHVkZXMoZWwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLy8gdGFyZ2V0IHN1cHBsaWVkLCBkb24ndCBjb3B5IG92ZXIgdGhlIHZhbHVlcyBvZiB0aGVzZSBwcm9wZXJ0aWVzXHJcbiAgICBpZiAodGFyZ2V0ICYmICF0YXJnZXRJc0VtcHR5KSB7XHJcbiAgICAgICAgYWxsb3dsaXN0ID0gYWxsb3dsaXN0LmZpbHRlcihmdW5jdGlvbiAoZWwpIHtcclxuICAgICAgICAgICAgcmV0dXJuICFbXCJpZFwiLCBcInR5cGVcIl0uaW5jbHVkZXMoZWwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgdmFyIG9iaiA9IHt9O1xyXG4gICAgaWYgKHRhcmdldElzRW1wdHkpIHtcclxuICAgICAgICBpZiAob2JqLmlkID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgb2JqLmlkID0gc291cmNlLmlkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob2JqLnR5cGUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBvYmoudHlwZSA9IHNvdXJjZS50eXBlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc291cmNlLmtleSlcclxuICAgICAgICAgICAgb2JqLmtleSA9IHNvdXJjZS5rZXk7XHJcbiAgICB9XHJcbiAgICBsZXQgcHJvcHM7XHJcbiAgICBpZiAoIWlzT2JqTGl0ZXJhbChzb3VyY2UpKSB7XHJcbiAgICAgICAgcHJvcHMgPSBPYmplY3QuZW50cmllcyhPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzb3VyY2UuX19wcm90b19fKSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBwcm9wcyA9IE9iamVjdC5lbnRyaWVzKHNvdXJjZSk7XHJcbiAgICB9XHJcbiAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBwcm9wcykge1xyXG4gICAgICAgIGlmIChhbGxvd2xpc3QuaW5jbHVkZXMoa2V5KSkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBvYmpba2V5XSA9PT0gXCJzeW1ib2xcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIG9ialtrZXldID0gXCJNaXhlZFwiO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc09iakxpdGVyYWwoc291cmNlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmpba2V5XSA9IHZhbHVlLmdldC5jYWxsKHNvdXJjZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmpba2V5XSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICBvYmpba2V5XSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBOZWVkcyBidWlsZGluZyBpblxyXG4gICAgICAgIC8vIGlmIChjYWxsYmFjaykge1xyXG4gICAgICAgIC8vICAgICBjYWxsYmFjayhvYmopXHJcbiAgICAgICAgLy8gfVxyXG4gICAgICAgIC8vIGVsc2Uge1xyXG4gICAgICAgIC8vIH1cclxuICAgIH1cclxuICAgIGlmICghcmVtb3ZlQ29uZmxpY3RzKSB7XHJcbiAgICAgICAgIW9iai5maWxsU3R5bGVJZCAmJiBvYmouZmlsbHMgPyBkZWxldGUgb2JqLmZpbGxTdHlsZUlkIDogZGVsZXRlIG9iai5maWxscztcclxuICAgICAgICAhb2JqLnN0cm9rZVN0eWxlSWQgJiYgb2JqLnN0cm9rZXNcclxuICAgICAgICAgICAgPyBkZWxldGUgb2JqLnN0cm9rZVN0eWxlSWRcclxuICAgICAgICAgICAgOiBkZWxldGUgb2JqLnN0cm9rZXM7XHJcbiAgICAgICAgIW9iai5iYWNrZ3JvdW5kU3R5bGVJZCAmJiBvYmouYmFja2dyb3VuZHNcclxuICAgICAgICAgICAgPyBkZWxldGUgb2JqLmJhY2tncm91bmRTdHlsZUlkXHJcbiAgICAgICAgICAgIDogZGVsZXRlIG9iai5iYWNrZ3JvdW5kcztcclxuICAgICAgICAhb2JqLmVmZmVjdFN0eWxlSWQgJiYgb2JqLmVmZmVjdHNcclxuICAgICAgICAgICAgPyBkZWxldGUgb2JqLmVmZmVjdFN0eWxlSWRcclxuICAgICAgICAgICAgOiBkZWxldGUgb2JqLmVmZmVjdHM7XHJcbiAgICAgICAgIW9iai5ncmlkU3R5bGVJZCAmJiBvYmoubGF5b3V0R3JpZHNcclxuICAgICAgICAgICAgPyBkZWxldGUgb2JqLmdyaWRTdHlsZUlkXHJcbiAgICAgICAgICAgIDogZGVsZXRlIG9iai5sYXlvdXRHcmlkcztcclxuICAgICAgICBpZiAob2JqLnRleHRTdHlsZUlkKSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBvYmouZm9udE5hbWU7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBvYmouZm9udFNpemU7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBvYmoubGV0dGVyU3BhY2luZztcclxuICAgICAgICAgICAgZGVsZXRlIG9iai5saW5lSGVpZ2h0O1xyXG4gICAgICAgICAgICBkZWxldGUgb2JqLnBhcmFncmFwaEluZGVudDtcclxuICAgICAgICAgICAgZGVsZXRlIG9iai5wYXJhZ3JhcGhTcGFjaW5nO1xyXG4gICAgICAgICAgICBkZWxldGUgb2JqLnRleHRDYXNlO1xyXG4gICAgICAgICAgICBkZWxldGUgb2JqLnRleHREZWNvcmF0aW9uO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZGVsZXRlIG9iai50ZXh0U3R5bGVJZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9iai5jb3JuZXJSYWRpdXMgIT09IGZpZ21hLm1peGVkKSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBvYmoudG9wTGVmdFJhZGl1cztcclxuICAgICAgICAgICAgZGVsZXRlIG9iai50b3BSaWdodFJhZGl1cztcclxuICAgICAgICAgICAgZGVsZXRlIG9iai5ib3R0b21MZWZ0UmFkaXVzO1xyXG4gICAgICAgICAgICBkZWxldGUgb2JqLmJvdHRvbVJpZ2h0UmFkaXVzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZGVsZXRlIG9iai5jb3JuZXJSYWRpdXM7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gT25seSBhcHBsaWNhYmxlIHRvIG9iamVjdHMgYmVjYXVzZSB0aGVzZSBwcm9wZXJ0aWVzIGNhbm5vdCBiZSBzZXQgb24gbm9kZXNcclxuICAgIGlmICh0YXJnZXRJc0VtcHR5KSB7XHJcbiAgICAgICAgaWYgKHNvdXJjZS5wYXJlbnQgJiYgIXdpdGhvdXRSZWxhdGlvbnMpIHtcclxuICAgICAgICAgICAgb2JqLnBhcmVudCA9IHsgaWQ6IHNvdXJjZS5wYXJlbnQuaWQsIHR5cGU6IHNvdXJjZS5wYXJlbnQudHlwZSB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIE9ubHkgYXBwbGljYWJsZSB0byBvYmplY3RzIGJlY2F1c2UgdGhlc2UgcHJvcGVydGllcyBjYW5ub3QgYmUgc2V0IG9uIG5vZGVzXHJcbiAgICBpZiAodGFyZ2V0SXNFbXB0eSkge1xyXG4gICAgICAgIGlmIChzb3VyY2UudHlwZSA9PT0gXCJGUkFNRVwiIHx8XHJcbiAgICAgICAgICAgIHNvdXJjZS50eXBlID09PSBcIkNPTVBPTkVOVFwiIHx8XHJcbiAgICAgICAgICAgIHNvdXJjZS50eXBlID09PSBcIkNPTVBPTkVOVF9TRVRcIiB8fFxyXG4gICAgICAgICAgICBzb3VyY2UudHlwZSA9PT0gXCJQQUdFXCIgfHxcclxuICAgICAgICAgICAgc291cmNlLnR5cGUgPT09IFwiR1JPVVBcIiB8fFxyXG4gICAgICAgICAgICBzb3VyY2UudHlwZSA9PT0gXCJJTlNUQU5DRVwiIHx8XHJcbiAgICAgICAgICAgIHNvdXJjZS50eXBlID09PSBcIkRPQ1VNRU5UXCIgfHxcclxuICAgICAgICAgICAgc291cmNlLnR5cGUgPT09IFwiQk9PTEVBTl9PUEVSQVRJT05cIikge1xyXG4gICAgICAgICAgICBpZiAoc291cmNlLmNoaWxkcmVuICYmICF3aXRob3V0UmVsYXRpb25zKSB7XHJcbiAgICAgICAgICAgICAgICBvYmouY2hpbGRyZW4gPSBzb3VyY2UuY2hpbGRyZW4ubWFwKChjaGlsZCkgPT4gY29weVBhc3RlKGNoaWxkLCB7fSwgeyB3aXRob3V0UmVsYXRpb25zIH0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc291cmNlLnR5cGUgPT09IFwiSU5TVEFOQ0VcIikge1xyXG4gICAgICAgICAgICBpZiAoc291cmNlLm1haW5Db21wb25lbnQgJiYgIXdpdGhvdXRSZWxhdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIG9iai5tYXN0ZXJDb21wb25lbnQgPSBjb3B5UGFzdGUoc291cmNlLm1haW5Db21wb25lbnQsIHt9LCB7IHdpdGhvdXRSZWxhdGlvbnMgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAodGFyZ2V0LnR5cGUgIT09IFwiRlJBTUVcIiB8fFxyXG4gICAgICAgIHRhcmdldC50eXBlICE9PSBcIkNPTVBPTkVOVFwiIHx8XHJcbiAgICAgICAgdGFyZ2V0LnR5cGUgIT09IFwiQ09NUE9ORU5UX1NFVFwiKSB7XHJcbiAgICAgICAgZGVsZXRlIG9iai5iYWNrZ3JvdW5kcztcclxuICAgIH1cclxuICAgIE9iamVjdC5hc3NpZ24odGFyZ2V0LCBvYmopO1xyXG4gICAgcmV0dXJuIHRhcmdldDtcclxufVxuXG5mdW5jdGlvbiBncm91cFRvRnJhbWUoZ3JvdXApIHtcclxuICAgIGxldCBncm91cFJvdGF0aW9uID0gZ3JvdXAucm90YXRpb247XHJcbiAgICAvLyBDcmVhdGUgZnJhbWUgdG8gcmVwbGFjZSBncm91cFxyXG4gICAgbGV0IGZyYW1lID0gZmlnbWEuY3JlYXRlRnJhbWUoKTtcclxuICAgIGZyYW1lLmZpbGxzID0gW107XHJcbiAgICBmcmFtZS54ID0gZ3JvdXAueDtcclxuICAgIGZyYW1lLnkgPSBncm91cC55O1xyXG4gICAgZnJhbWUubmFtZSA9IGdyb3VwLm5hbWU7XHJcbiAgICBmcmFtZS5yZXNpemUoZ3JvdXAud2lkdGgsIGdyb3VwLmhlaWdodCk7XHJcbiAgICAvLyBBZGQgZ3JvdXAgdG8gZnJhbWUgc28gdGhhdCB3ZSBjYW4gcmVzZXQgdGhlaXIgeCwgeSBjb3JkaW5hdGVzXHJcbiAgICBmcmFtZS5hcHBlbmRDaGlsZChncm91cCk7XHJcbiAgICAvLyBSZXNldCB4LCB5LCBhbmQgcm90YXRpb24gY29vcmRpbmF0ZXNcclxuICAgIGdyb3VwLnggPSAwO1xyXG4gICAgZ3JvdXAueSA9IDA7XHJcbiAgICBncm91cC5yb3RhdGlvbiA9IDA7XHJcbiAgICAvLyBVbmdyb3VwaW5nIHdpbGwgYXV0b21hdGljYWxseSBtYWtlIGNvbnRlbnRzIGNoaWxkcmVuIG9mIHRoZSBmcmFtZVxyXG4gICAgZmlnbWEudW5ncm91cChncm91cCk7XHJcbiAgICAvLyBSZS1hcHBseSByb3RhdGlvblxyXG4gICAgZnJhbWUucm90YXRpb24gPSBncm91cFJvdGF0aW9uO1xyXG4gICAgcmV0dXJuIGZyYW1lO1xyXG59XHJcbi8qKlxyXG4gKiBDb252ZXJ0cyBhbiBpbnN0YW5jZSwgY29tcG9uZW50LCBvciByZWN0YW5nbGUgdG8gYSBmcmFtZVxyXG4gKiBAcGFyYW0ge1NjZW5lTm9kZX0gbm9kZSBUaGUgbm9kZSB5b3Ugd2FudCB0byBjb252ZXJ0IHRvIGEgZnJhbWVcclxuICogQHJldHVybnMgUmV0dXJucyB0aGUgbmV3IG5vZGUgYXMgYSBmcmFtZVxyXG4gKi9cclxuZnVuY3Rpb24gY29udmVydFRvRnJhbWUobm9kZSkge1xyXG4gICAgLy8gU2F2ZSBpbmRleCwgcGFyZW50IGFuZCByb3RhdGlvbiBvZiBncm91cCBiZWZvcmUgcmVtb3ZlZFxyXG4gICAgbGV0IG5vZGVJbmRleCA9IG5vZGUucGFyZW50LmNoaWxkcmVuLmluZGV4T2Yobm9kZSk7XHJcbiAgICBsZXQgbm9kZVBhcmVudCA9IG5vZGUucGFyZW50O1xyXG4gICAgbGV0IG5ld0ZyYW1lO1xyXG4gICAgaWYgKG5vZGUudHlwZSA9PT0gXCJJTlNUQU5DRVwiKSB7XHJcbiAgICAgICAgbmV3RnJhbWUgPSBub2RlLmRldGFjaEluc3RhbmNlKCk7XHJcbiAgICB9XHJcbiAgICBpZiAobm9kZS50eXBlID09PSBcIkNPTVBPTkVOVFwiKSB7XHJcbiAgICAgICAgLy8gVGhpcyBtZXRob2QgcHJlc2VydmVzIHBsdWdpbiBkYXRhIGFuZCByZWxhdW5jaCBkYXRhXHJcbiAgICAgICAgbGV0IGZyYW1lID0gbm9kZS5jcmVhdGVJbnN0YW5jZSgpLmRldGFjaEluc3RhbmNlKCk7XHJcbiAgICAgICAgLy8gQmVhY3VzZSBgY3JlYXRlSW5zdGFuY2VgIGRvZXNuJ3QgaW5oZXJpdCByb3RhdGlvbiwgYXBwYXJlbnRseVxyXG4gICAgICAgIGZyYW1lLnJvdGF0aW9uID0gbm9kZS5yb3RhdGlvbjtcclxuICAgICAgICBub2RlUGFyZW50LmFwcGVuZENoaWxkKGZyYW1lKTtcclxuICAgICAgICBjb3B5UGFzdGUobm9kZSwgZnJhbWUsIHsgaW5jbHVkZTogW1wieFwiLCBcInlcIl0gfSk7XHJcbiAgICAgICAgLy8gVHJlYXQgbGlrZSBuYXRpdmUgbWV0aG9kXHJcbiAgICAgICAgZmlnbWEuY3VycmVudFBhZ2UuYXBwZW5kQ2hpbGQoZnJhbWUpO1xyXG4gICAgICAgIG5vZGUucmVtb3ZlKCk7XHJcbiAgICAgICAgbmV3RnJhbWUgPSBmcmFtZTtcclxuICAgIH1cclxuICAgIGlmIChub2RlLnR5cGUgPT09IFwiR1JPVVBcIikge1xyXG4gICAgICAgIGxldCBmcmFtZSA9IGdyb3VwVG9GcmFtZShub2RlKTtcclxuICAgICAgICBuZXdGcmFtZSA9IGZyYW1lO1xyXG4gICAgfVxyXG4gICAgaWYgKG5vZGUudHlwZSA9PT0gXCJSRUNUQU5HTEVcIikge1xyXG4gICAgICAgIGxldCBmcmFtZSA9IGZpZ21hLmNyZWF0ZUZyYW1lKCk7XHJcbiAgICAgICAgLy8gRklYTUU6IEFkZCB0aGlzIGludG8gY29weVBhc3RlIGhlbHBlclxyXG4gICAgICAgIGZyYW1lLnJlc2l6ZVdpdGhvdXRDb25zdHJhaW50cyhub2RlLndpZHRoLCBub2RlLmhlaWdodCk7XHJcbiAgICAgICAgY29weVBhc3RlKG5vZGUsIGZyYW1lKTtcclxuICAgICAgICBub2RlLnJlbW92ZSgpO1xyXG4gICAgICAgIG5ld0ZyYW1lID0gZnJhbWU7XHJcbiAgICB9XHJcbiAgICBpZiAobm9kZS50eXBlID09PSBcIkZSQU1FXCIpIHtcclxuICAgICAgICAvLyBEb24ndCBkbyBhbnl0aGluZyB0byBpdCBpZiBpdCdzIGEgZnJhbWVcclxuICAgICAgICBuZXdGcmFtZSA9IG5vZGU7XHJcbiAgICB9XHJcbiAgICAvLyBSZS1pbnNlcnQgZnJhbWUgaW50byBpdHMgb3JpZ2luYWwgcG9zaXRpb25cclxuICAgIG5vZGVQYXJlbnQuaW5zZXJ0Q2hpbGQobm9kZUluZGV4LCBuZXdGcmFtZSk7XHJcbiAgICByZXR1cm4gbmV3RnJhbWU7XHJcbn1cblxuLyoqXHJcbiAqIE1vdmVzIGNoaWxkcmVuIGZyb20gb25lIG5vZGUgdG8gYW5vdGhlclxyXG4gKiBAcGFyYW0ge1NjZW5lTm9kZX0gc291cmNlIFRoZSBub2RlIHlvdSB3YW50IHRvIG1vdmUgY2hpbGRyZW4gZnJvbVxyXG4gKiBAcGFyYW0ge1NjZW5lTm9kZX0gdGFyZ2V0IFRoZSBub2RlIHlvdSB3YW50IHRvIG1vdmUgY2hpbGRyZW4gdG9cclxuICogQHJldHVybnMgUmV0dXJucyB0aGUgbmV3IHRhcmdldCB3aXRoIGl0cyBjaGlsZHJlblxyXG4gKi9cclxuZnVuY3Rpb24gbW92ZUNoaWxkcmVuKHNvdXJjZSwgdGFyZ2V0KSB7XHJcbiAgICBsZXQgY2hpbGRyZW4gPSBzb3VyY2UuY2hpbGRyZW47XHJcbiAgICBsZXQgbGVuZ3RoID0gY2hpbGRyZW4ubGVuZ3RoO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGxldCBjaGlsZCA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChjaGlsZCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGFyZ2V0O1xyXG59XG5cbi8qKlxyXG4gKiBDb252ZXJ0cyBhbiBpbnN0YW5jZSwgZnJhbWUsIG9yIHJlY3RhbmdsZSB0byBhIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge1NjZW5lTm9kZX0gbm9kZSBUaGUgbm9kZSB5b3Ugd2FudCB0byBjb252ZXJ0IHRvIGEgY29tcG9uZW50XHJcbiAqIEByZXR1cm5zIFJldHVybnMgdGhlIG5ldyBub2RlIGFzIGEgY29tcG9uZW50XHJcbiAqL1xyXG4vLyBGSVhNRTogVHlwZXNjcmlwdCBzYXlzIGRldGFjaEluc3RhbmNlKCkgZG9lc24ndCBleGlzdCBvbiBTY2VuZU5vZGUgJiBDaGlsZHJlbk1peGluIFxyXG5mdW5jdGlvbiBjb252ZXJ0VG9Db21wb25lbnQobm9kZSkge1xyXG4gICAgY29uc3QgY29tcG9uZW50ID0gZmlnbWEuY3JlYXRlQ29tcG9uZW50KCk7XHJcbiAgICBub2RlID0gY29udmVydFRvRnJhbWUobm9kZSk7XHJcbiAgICAvLyBGSVhNRTogQWRkIHRoaXMgaW50byBjb3B5UGFzdGUgaGVscGVyXHJcbiAgICBjb21wb25lbnQucmVzaXplV2l0aG91dENvbnN0cmFpbnRzKG5vZGUud2lkdGgsIG5vZGUuaGVpZ2h0KTtcclxuICAgIGNvcHlQYXN0ZShub2RlLCBjb21wb25lbnQpO1xyXG4gICAgbW92ZUNoaWxkcmVuKG5vZGUsIGNvbXBvbmVudCk7XHJcbiAgICBub2RlLnJlbW92ZSgpO1xyXG4gICAgcmV0dXJuIGNvbXBvbmVudDtcclxufVxuXG4vKipcclxuICogSGVscGVycyB3aGljaCBhdXRvbWF0aWNhbGx5IHBhcnNlIGFuZCBzdHJpbmdpZnkgd2hlbiB5b3UgZ2V0LCBzZXQgb3IgdXBkYXRlIHBsdWdpbiBkYXRhXHJcbiAqL1xyXG4vKipcclxuICpcclxuICogQHBhcmFtIHtCYXNlTm9kZX0gbm9kZSBBIGZpZ21hIG5vZGUgdG8gZ2V0IGRhdGEgZnJvbVxyXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5ICBUaGUga2V5IHVuZGVyIHdoaWNoIGRhdGEgaXMgc3RvcmVkXHJcbiAqIEByZXR1cm5zIFBsdWdpbiBEYXRhXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRQbHVnaW5EYXRhKG5vZGUsIGtleSwgb3B0cykge1xyXG4gICAgdmFyIGRhdGE7XHJcbiAgICBkYXRhID0gbm9kZS5nZXRQbHVnaW5EYXRhKGtleSk7XHJcbiAgICBpZiAoZGF0YSkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gXCJzdHJpbmdcIiAmJiBkYXRhLnN0YXJ0c1dpdGgoXCI+Pj5cIikpIHtcclxuICAgICAgICAgICAgZGF0YSA9IGRhdGE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBkYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBkYXRhID0gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiBkYXRhID09PSBcInN0cmluZ1wiICYmIGRhdGEuc3RhcnRzV2l0aChcIj4+PlwiKSkge1xyXG4gICAgICAgIGRhdGEgPSBkYXRhLnNsaWNlKDMpO1xyXG4gICAgICAgIHZhciBzdHJpbmcgPSBgKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBgICtcclxuICAgICAgICAgICAgZGF0YSArXHJcbiAgICAgICAgICAgIGBcbiAgICAgICAgICAgIH0pKClgO1xyXG4gICAgICAgIGRhdGEgPSBldmFsKHN0cmluZyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZGF0YTtcclxufVxyXG4vKipcclxuICpcclxuICogQHBhcmFtIHtCYXNlTm9kZX0gbm9kZSAgQSBmaWdtYSBub2RlIHRvIHNldCBkYXRhIG9uXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXkgQSBrZXkgdG8gc3RvcmUgZGF0YSB1bmRlclxyXG4gKiBAcGFyYW0ge2FueX0gZGF0YSBEYXRhIHRvIGJlIHN0b2VkXHJcbiAqL1xyXG5mdW5jdGlvbiBzZXRQbHVnaW5EYXRhKG5vZGUsIGtleSwgZGF0YSkge1xyXG4gICAgaWYgKHR5cGVvZiBkYXRhID09PSBcInN0cmluZ1wiICYmIGRhdGEuc3RhcnRzV2l0aChcIj4+PlwiKSkge1xyXG4gICAgICAgIG5vZGUuc2V0UGx1Z2luRGF0YShrZXksIGRhdGEpO1xyXG4gICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgbm9kZS5zZXRQbHVnaW5EYXRhKGtleSwgSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xyXG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShkYXRhKTtcclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiB1cGRhdGVQbHVnaW5EYXRhKG5vZGUsIGtleSwgY2FsbGJhY2spIHtcclxuICAgIHZhciBkYXRhO1xyXG4gICAgaWYgKG5vZGUuZ2V0UGx1Z2luRGF0YShrZXkpKSB7XHJcbiAgICAgICAgZGF0YSA9IEpTT04ucGFyc2Uobm9kZS5nZXRQbHVnaW5EYXRhKGtleSkpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgZGF0YSA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBkYXRhID0gY2FsbGJhY2soZGF0YSk7XHJcbiAgICAvLyBXaGF0IHNob3VsZCBoYXBwZW4gaWYgdXNlciBkb2Vzbid0IHJldHVybiBhbnl0aGluZyBpbiBjYWxsYmFjaz9cclxuICAgIGlmICghZGF0YSkge1xyXG4gICAgICAgIGRhdGEgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgbm9kZS5zZXRQbHVnaW5EYXRhKGtleSwgSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xyXG4gICAgcmV0dXJuIGRhdGE7XHJcbn1cblxuLy9UT0RPOiBXcml0ZSB0ZXN0cyBmb3IgZmxpcHNcclxuLyoqXHJcbiogRmxpcHMgYSBub2RlIG9uIHRoZSBYIGF4aXMsIG1pbWljcyB0aGUgbmF0aXZlIGZpZ21hIGZ1bmN0aW9uYWxpdHkuXHJcbiogVHJhbnNmb3JtIGlzIGNlbnRlcmVkIG9uIHRoZSBub2RlXHJcbipcclxuKiBAcGFyYW0gbm9kZSAtIFRoZSBub2RlIHlvdSB3YW50IHRvIGZsaXBcclxuKi9cclxuZnVuY3Rpb24gZmxpcFgobm9kZSkge1xyXG4gICAgbGV0IHJ0ID0gbm9kZS5yZWxhdGl2ZVRyYW5zZm9ybTtcclxuICAgIGxldCBib3VuZHMgPSBub2RlLmFic29sdXRlUmVuZGVyQm91bmRzO1xyXG4gICAgbGV0IFtbYSwgYywgZV0sIFtiLCBkLCBmXV0gPSBbLi4ucnRdO1xyXG4gICAgbGV0IG11bHQgPSBhIDwgMCA/IDAgOiAxO1xyXG4gICAgbGV0IG5ld0Fic1ggPSBib3VuZHMueCArIGJvdW5kcy53aWR0aCAqIG11bHQ7XHJcbiAgICBub2RlLnJlbGF0aXZlVHJhbnNmb3JtID0gW1xyXG4gICAgICAgIFsoYSAqPSAtMSksIChjICo9IC0xKSwgbmV3QWJzWF0sXHJcbiAgICAgICAgW2IsIGQsIGZdLFxyXG4gICAgXTtcclxufVxyXG4vKipcclxuKiBGbGlwcyBhIG5vZGUgb24gdGhlIFkgYXhpcywgbWltaWNzIHRoZSBuYXRpdmUgZmlnbWEgZnVuY3Rpb25hbGl0eS5cclxuKiBUcmFuc2Zvcm0gaXMgY2VudGVyZWQgb24gdGhlIG5vZGVcclxuKlxyXG4qIEBwYXJhbSBub2RlIC0gVGhlIG5vZGUgeW91IHdhbnQgdG8gZmxpcFxyXG4qL1xyXG5mdW5jdGlvbiBmbGlwWShub2RlKSB7XHJcbiAgICBsZXQgcnQgPSBub2RlLnJlbGF0aXZlVHJhbnNmb3JtO1xyXG4gICAgbGV0IGJvdW5kcyA9IG5vZGUuYWJzb2x1dGVSZW5kZXJCb3VuZHM7XHJcbiAgICBsZXQgbWlkWSA9IGJvdW5kcy55ICsgYm91bmRzLmhlaWdodCAvIDI7XHJcbiAgICBsZXQgZFkgPSBtaWRZIC0gbm9kZS55O1xyXG4gICAgbGV0IG5ld1kgPSBub2RlLnkgKyBkWSAqIDI7XHJcbiAgICBsZXQgW1thLCBjLCBlXSwgW2IsIGQsIGZdXSA9IFsuLi5ydF07XHJcbiAgICBub2RlLnJlbGF0aXZlVHJhbnNmb3JtID0gW1xyXG4gICAgICAgIFthLCBjLCBlXSxcclxuICAgICAgICBbKGIgKj0gLTEpLCAoZCAqPSAtMSksIG5ld1ldLFxyXG4gICAgXTtcclxufVxuXG4vKipcclxuICogQ29udmluaWVudCB3YXkgdG8gZGVsZXRlIGNoaWxkcmVuIG9mIGEgbm9kZVxyXG4gKiBAcGFyYW0ge1NjZW5lTm9kZSAmIENoaWxkcmVuTWl4aW4gfSBub2RlIEEgbm9kZSB3aXRoIGNoaWxkcmVuXHJcbiAqL1xyXG5mdW5jdGlvbiByZW1vdmVDaGlsZHJlbihub2RlKSB7XHJcbiAgICBsZXQgbGVuZ3RoID0gbm9kZS5jaGlsZHJlbi5sZW5ndGg7XHJcbiAgICAvLyBIYXMgdG8gaGFwcGVuIGluIHJldmVyc2UgYmVjYXVzZSBvZiBvcmRlciBsYXllcnMgYXJlIGxpc3RlZFxyXG4gICAgZm9yIChsZXQgaSA9IGxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgbm9kZS5jaGlsZHJlbltpXS5yZW1vdmUoKTtcclxuICAgIH1cclxufVxuXG4vKipcclxuICogUmVzaXplcyBhIG5vZGUsIHRvIGFsbG93IG5vZGVzIG9mIHNpemUgPCAwLjAxXHJcbiAqIEEgdmFsdWUgb2YgemVybyB3aWxsIGJlIHJlcGxhY2VkIHdpdGggMS9OdW1iZXIuTUFYX1NBRkVfSU5URUdFUlxyXG4gKiBAcGFyYW0ge1NjZW5lTm9kZSAmIExheW91dE1peGlufSBub2RlIE5vZGUgdG8gcmVzaXplXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aFxyXG4gKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XHJcbiAqIEByZXR1cm5zIFJlc2l6ZWQgTm9kZVxyXG4gKi9cclxuZnVuY3Rpb24gcmVzaXplKG5vZGUsIHdpZHRoLCBoZWlnaHQpIHtcclxuICAgIC8vV29ya2Fyb3VuZCB0byByZXNpemUgYSBub2RlLCBpZiBpdHMgc2l6ZSBpcyBsZXNzIHRoYW4gMC4wMVxyXG4gICAgLy9JZiAwLCBtYWtlIGl0IGFsbW9zdCB6ZXJvXHJcbiAgICB3aWR0aCA9PT0gMCA/IHdpZHRoID0gMSAvIE51bWJlci5NQVhfU0FGRV9JTlRFR0VSIDogbnVsbDtcclxuICAgIGhlaWdodCA9PT0gMCA/IGhlaWdodCA9IDEgLyBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUiA6IG51bGw7XHJcbiAgICBsZXQgbm9kZVBhcmVudCA9IG5vZGUucGFyZW50O1xyXG4gICAgbm9kZS5yZXNpemUod2lkdGggPCAwLjAxID8gMSA6IHdpZHRoLCBoZWlnaHQgPCAwLjAxID8gMSA6IGhlaWdodCk7XHJcbiAgICBpZiAod2lkdGggPCAwLjAxIHx8IGhlaWdodCA8IDAuMDEpIHtcclxuICAgICAgICBsZXQgZHVtbXkgPSBmaWdtYS5jcmVhdGVSZWN0YW5nbGUoKTtcclxuICAgICAgICBkdW1teS5yZXNpemUod2lkdGggPCAwLjAxID8gMSAvIHdpZHRoIDogd2lkdGgsIGhlaWdodCA8IDAuMDEgPyAxIC8gaGVpZ2h0IDogaGVpZ2h0KTtcclxuICAgICAgICBsZXQgZ3JvdXAgPSBmaWdtYS5ncm91cChbbm9kZSwgZHVtbXldLCBmaWdtYS5jdXJyZW50UGFnZSk7XHJcbiAgICAgICAgZ3JvdXAucmVzaXplKHdpZHRoIDwgMC4wMSA/IDEgOiB3aWR0aCwgaGVpZ2h0IDwgMC4wMSA/IDEgOiBoZWlnaHQpO1xyXG4gICAgICAgIG5vZGVQYXJlbnQuYXBwZW5kQ2hpbGQobm9kZSk7XHJcbiAgICAgICAgZ3JvdXAucmVtb3ZlKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbm9kZTtcclxufVxuXG4vKipcclxuICogTWltaWNzIHNpbWlsYXIgYmVoYXZpb3VyIHRvIHVuZ3JvdXBpbmcgbm9kZXMgaW4gZWRpdG9yLlxyXG4gKiBAcGFyYW0ge1NjZW5lTm9kZSAmIENoaWxkcmVuTWl4aW4gfSBub2RlIEEgbm9kZSB3aXRoIGNoaWxkcmVuXHJcbiAqIEBwYXJhbSBwYXJlbnQgVGFyZ2V0IGNvbnRhaW5lciB0byBhcHBlbmQgdW5ncm91cGVkIG5vZGVzIHRvXHJcbiAqIEByZXR1cm5zIFNlbGVjdGlvbiBvZiBub2RlJ3MgY2hpbGRyZW5cclxuICovXHJcbmZ1bmN0aW9uIHVuZ3JvdXAobm9kZSwgcGFyZW50KSB7XHJcbiAgICBsZXQgc2VsZWN0aW9uID0gW107XHJcbiAgICBsZXQgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHBhcmVudC5hcHBlbmRDaGlsZChjaGlsZHJlbltpXSk7XHJcbiAgICAgICAgc2VsZWN0aW9uLnB1c2goY2hpbGRyZW5baV0pO1xyXG4gICAgfVxyXG4gICAgLy8gRG9lc24ndCBuZWVkIHJlbW92aW5nIGlmIGl0J3MgYSBncm91cCBub2RlXHJcbiAgICBpZiAobm9kZS50eXBlICE9PSBcIkdST1VQXCIpIHtcclxuICAgICAgICBub2RlLnJlbW92ZSgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNlbGVjdGlvbjtcclxufVxuXG4vKipcclxuICogQ29udmVydHMgYSBoZXgsIG9yIGFycmF5IG9mIGhleGVzIGludG8gUGFpbnRzW11cclxuICogQ2FuIGJlIHVzZWQgdG8gZmlsbCBhIG5vZGVcclxuICogZS5nIG5vZGUuZmlsbHMgPSBoZXhUb1BhaW50cyhcIiNmZjAwMDBcIilcclxuICogQHBhcmFtIHtzdHJpbmcgfCBzdHJpbmdbXSB9IGhleFxyXG4gKi9cclxuZnVuY3Rpb24gaGV4VG9QYWludHMoaGV4ZXMpIHtcclxuICAgIGlmICh0eXBlb2YgaGV4ZXMgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgaGV4ZXMgPSBbaGV4ZXNdO1xyXG4gICAgfVxyXG4gICAgY29uc3QgUGFpbnRzID0gaGV4ZXMubWFwKGhleCA9PiB7XHJcbiAgICAgICAgbGV0IGNvbG9yID0gaGV4VG9SZ2IoaGV4KTtcclxuICAgICAgICBpZiAoY29sb3IgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aHJvdyAoJ0NvbG9yIGlzIG51bGwnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGxldCBwYWludCA9IHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IFwiU09MSURcIixcclxuICAgICAgICAgICAgICAgIGNvbG9yOiBjb2xvci5jb2xvcixcclxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IGNvbG9yLm9wYWNpdHlcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIHBhaW50O1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIFBhaW50cztcclxufVxyXG5mdW5jdGlvbiBoZXhUb1JnYihoZXgpIHtcclxuICAgIGhleCA9IGhleC5yZXBsYWNlKCcjJywgJycpO1xyXG4gICAgaGV4Lmxlbmd0aCA9PSAzID8gaGV4ICs9IFwiRlwiIDogbnVsbDtcclxuICAgIGhleC5sZW5ndGggPT0gNCA/IGhleCA9IGhleC5yZXBsYWNlKG5ldyBSZWdFeHAoXCIoWzAtOWEtZkEtRl0pKFswLTlhLWZBLUZdKShbMC05YS1mQS1GXSkoWzAtOWEtZkEtRl0pXCIpLCBcIiQxJDEkMiQyJDMkMyQ0JDRcIikgOiBudWxsO1xyXG4gICAgaGV4Lmxlbmd0aCA9PSA2ID8gaGV4ICs9IFwiRkZcIiA6IG51bGw7XHJcbiAgICBjb25zb2xlLmxvZyhoZXgpO1xyXG4gICAgdmFyIHJlc3VsdCA9IC9eIz8oW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pJC9pLmV4ZWMoaGV4KTtcclxuICAgIHJldHVybiByZXN1bHQgPyB7XHJcbiAgICAgICAgY29sb3I6IHtcclxuICAgICAgICAgICAgcjogcGFyc2VJbnQocmVzdWx0WzFdLCAxNikgLyAyNTUsXHJcbiAgICAgICAgICAgIGc6IHBhcnNlSW50KHJlc3VsdFsyXSwgMTYpIC8gMjU1LFxyXG4gICAgICAgICAgICBiOiBwYXJzZUludChyZXN1bHRbM10sIDE2KSAvIDI1NVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb3BhY2l0eTogcGFyc2VGbG9hdCgocGFyc2VJbnQocmVzdWx0WzRdLCAxNikgLyAyNTUpLnRvRml4ZWQoMikpXHJcbiAgICB9IDogbnVsbDtcclxufVxuXG4vKipcclxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBub2RlIGlzIG5lc3RlZCBpbnNpZGUgYW4gaW5zdGFuY2UuIEl0IGRvZXMgbm90IGluY2x1ZGUgdGhlIGluc3RhbmNlIGl0c2VsZi5cclxuICogQHBhcmFtIHtTY2VuZU5vZGV9IG5vZGUgQSBub2RlIHlvdSB3YW50IHRvIGNoZWNrXHJcbiAqIEByZXR1cm5zIFJldHVybnMgdHJ1ZSBpZiBpbnNpZGUgYW4gaW5zdGFuY2VcclxuICovXHJcbmZ1bmN0aW9uIGlzSW5zaWRlSW5zdGFuY2Uobm9kZSkge1xyXG4gICAgY29uc3QgcGFyZW50ID0gbm9kZS5wYXJlbnQ7XHJcbiAgICAvLyBTb21ldGltZXMgcGFyZW50IGlzIG51bGxcclxuICAgIGlmIChwYXJlbnQpIHtcclxuICAgICAgICBpZiAocGFyZW50ICYmIHBhcmVudC50eXBlID09PSAnSU5TVEFOQ0UnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChwYXJlbnQgJiYgcGFyZW50LnR5cGUgPT09ICdQQUdFJykge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gaXNJbnNpZGVJbnN0YW5jZShwYXJlbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufVxuXG4vKipcclxuICogUmV0dXJucyB0aGUgY2xvc2V0IHBhcmVudCBpbnN0YW5jZVxyXG4gKiBAcGFyYW0ge1NjZW5lTm9kZX0gbm9kZSBBbiBzcGVjaWZpYyBub2RlIHlvdSB3YW50IHRvIGdldCB0aGUgcGFyZW50IGluc3RhbmNlIGZvclxyXG4gKiBAcmV0dXJucyBSZXR1cm5zIHRoZSBwYXJlbnQgaW5zdGFuY2Ugbm9kZVxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0UGFyZW50SW5zdGFuY2Uobm9kZSkge1xyXG4gICAgY29uc3QgcGFyZW50ID0gbm9kZS5wYXJlbnQ7XHJcbiAgICBpZiAobm9kZS50eXBlID09PSBcIlBBR0VcIilcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgaWYgKHBhcmVudC50eXBlID09PSBcIklOU1RBTkNFXCIpIHtcclxuICAgICAgICByZXR1cm4gcGFyZW50O1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIGdldFBhcmVudEluc3RhbmNlKHBhcmVudCk7XHJcbiAgICB9XHJcbn1cblxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGluZGV4IG9mIGEgbm9kZVxyXG4gKiBAcGFyYW0ge1NjZW5lTm9kZX0gbm9kZSBBIG5vZGVcclxuICogQHJldHVybnMgVGhlIGluZGV4IG9mIHRoZSBub2RlXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXROb2RlSW5kZXgobm9kZSkge1xyXG4gICAgcmV0dXJuIG5vZGUucGFyZW50LmNoaWxkcmVuLmluZGV4T2Yobm9kZSk7XHJcbn1cblxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGxvY2F0aW9uIG9mIHRoZSBub2RlXHJcbiAqIEBwYXJhbSB7U2NlbmVOb2RlfSBub2RlIEEgbm9kZSB5b3Ugd2FudCB0aGUgbG9jYXRpb24gb2ZcclxuICogQHBhcmFtIHtTY2VuZU5vZGV9IGNvbnRhaW5lciBUaGUgY29udGFpbmVyIHlvdSB3b3VsZCBsaWtlIHRvIGNvbXBhcmUgdGhlIG5vZGUncyBsb2NhdGlvbiB3aXRoXHJcbiAqIEByZXR1cm5zIEFuIGFycmF5IG9mIG5vZGUgaW5kZXhlcy4gVGhlIGZpcnN0IGl0ZW0gaXMgdGhlIGNvbnRhaW5lciBub2RlXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXROb2RlTG9jYXRpb24obm9kZSwgY29udGFpbmVyID0gZmlnbWEuY3VycmVudFBhZ2UsIGxvY2F0aW9uID0gW10pIHtcclxuICAgIGlmIChub2RlICYmIGNvbnRhaW5lcikge1xyXG4gICAgICAgIGlmIChub2RlLmlkID09PSBjb250YWluZXIuaWQpIHtcclxuICAgICAgICAgICAgaWYgKGxvY2F0aW9uLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGxvY2F0aW9uLnB1c2goY29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgIC8vIEJlY2F1c2Ugbm9kZXNJbmRleCBoYXZlIGJlZW4gY2FwdHVyZWQgaW4gcmV2ZXJzZVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxvY2F0aW9uLnJldmVyc2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKG5vZGUucGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbm9kZUluZGV4ID0gZ2V0Tm9kZUluZGV4KG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgKG5vZGUucGFyZW50LmxheW91dE1vZGUgPT0gXCJIT1JJWk9OVEFMXCIgfHwgbm9kZS5wYXJlbnQubGF5b3V0TW9kZSA9PT0gXCJWRVJUSUNBTFwiKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBcdG5vZGVJbmRleCA9IChub2RlLnBhcmVudC5jaGlsZHJlbi5sZW5ndGggLSAxKSAtIGdldE5vZGVJbmRleChub2RlKVxyXG4gICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICAgICAgbG9jYXRpb24ucHVzaChub2RlSW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldE5vZGVMb2NhdGlvbihub2RlLnBhcmVudCwgY29udGFpbmVyLCBsb2NhdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKFwiTm9kZSBvciBjb250YWluZXIgbm90IGRlZmluZWRcIik7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59XG5cbi8qKlxyXG4gKiBQcm92aWRlcyB0aGUgY291bnRlcnBhcnQgY29tcG9uZW50IG5vZGUgdG8gdGhlIHNlbGVjdGVkIGluc3RhbmNlIG5vZGUuIFJhdGhlciB0aGFuIHVzZSB0aGUgaW5zdGFuY2Ugbm9kZSBpZCwgaXQgc3RvcmVzIHRoZSBsb2NhdGlvbiBvZiB0aGUgbm9kZSBhbmQgdGhlbiBsb29rcyBmb3IgdGhlIHNhbWUgbm9kZSBpbiB0aGUgbWFpbiBjb21wb25lbnQuXHJcbiAqIEBwYXJhbSB7U2NlbmVOb2RlICYgQ2hpbGRyZW5NaXhpbiB9IG5vZGUgQSBub2RlIHdpdGggY2hpbGRyZW5cclxuICogQHJldHVybnMgUmV0dXJucyB0aGUgY291bnRlcnBhcnQgY29tcG9uZW50IG5vZGVcclxuICovXHJcbi8vIFRPRE86IFNob3VsZCB0aGVyZSBiZSB0d28gZnVuY3Rpb25zPywgb25lIHRoYXQgZ2V0cyBvcmlnaW5hbCBjb21wb25lbnQsIGFuZCBvbmUgdGhhdCBnZXRzIHByb3RvdHlwZSBcclxuLy8gVXNpbmcgZ2V0VG9wSW5zdGFuY2UgbWF5IHJldHVybiBjb3VudGVycGFydCB3aGljaCBoYXMgYmVlbiBzd2FwcGVkIGJ5IHRoZSB1c2VyXHJcbmZ1bmN0aW9uIGdldEluc3RhbmNlQ291bnRlcnBhcnRVc2luZ0xvY2F0aW9uKG5vZGUsIHBhcmVudEluc3RhbmNlID0gZ2V0UGFyZW50SW5zdGFuY2Uobm9kZSksIGxvY2F0aW9uID0gZ2V0Tm9kZUxvY2F0aW9uKG5vZGUsIHBhcmVudEluc3RhbmNlKSwgcGFyZW50Q29tcG9uZW50Tm9kZSA9IHBhcmVudEluc3RhbmNlID09PSBudWxsIHx8IHBhcmVudEluc3RhbmNlID09PSB2b2lkIDAgPyB2b2lkIDAgOiBwYXJlbnRJbnN0YW5jZS5tYWluQ29tcG9uZW50KSB7XHJcbiAgICBpZiAobG9jYXRpb24pIHtcclxuICAgICAgICBsb2NhdGlvbi5zaGlmdCgpO1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGxvY2F0aW9uKVxyXG4gICAgICAgIGZ1bmN0aW9uIGxvb3BDaGlsZHJlbihjaGlsZHJlbiwgZCA9IDApIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNoaWxkID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICB2YXIgbm9kZUluZGV4ID0gbG9jYXRpb25bZF07XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh7IGN1cnJlbnQ6IGdldE5vZGVJbmRleChjaGlsZCksIGRlc2lyZWQ6IG5vZGVJbmRleCB9LCBjaGlsZC5uYW1lKVxyXG4gICAgICAgICAgICAgICAgaWYgKGdldE5vZGVJbmRleChjaGlsZCkgPT09IG5vZGVJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiPj4+ICBcIiwgY2hpbGQubmFtZSlcclxuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhsb2NhdGlvbi5sZW5ndGggLSAxLCBkKVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIGxhc3QgaW4gYXJyYXlcclxuICAgICAgICAgICAgICAgICAgICBpZiAobG9jYXRpb24ubGVuZ3RoIC0gMSA9PT0gZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh7IGN1cnJlbnQ6IGdldE5vZGVJbmRleChjaGlsZCksIGRlc2lyZWQ6IG5vZGVJbmRleCB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2hpbGQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHsgY3VycmVudDogZ2V0Tm9kZUluZGV4KGNoaWxkKSwgZGVzaXJlZDogbm9kZUluZGV4IH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9vcENoaWxkcmVuKGNoaWxkLmNoaWxkcmVuLCBkICsgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZyh7IGN1cnJlbnQ6IGdldE5vZGVJbmRleChjaGlsZCksIGRlc2lyZWQ6IG5vZGVJbmRleCB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgY29uc29sZS5sb2coY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAvLyByZXR1cm4gY2hpbGRcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocGFyZW50Q29tcG9uZW50Tm9kZSAmJiBwYXJlbnRDb21wb25lbnROb2RlLmNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBsb29wQ2hpbGRyZW4ocGFyZW50Q29tcG9uZW50Tm9kZS5jaGlsZHJlbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbm9kZS5tYWluQ29tcG9uZW50O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxuXG4vKipcclxuICogUHJvdmlkZXMgdGhlIGNvdW50ZXJwYXJ0IGNvbXBvbmVudCBub2RlIHRvIHRoZSBzZWxlY3RlZCBpbnN0YW5jZSBub2RlLiBJdCBkZWZhdWx0cyB0byB1c2luZyB0aGUgaW5zdGFuY2Ugbm9kZSBpZCB0byBmaW5kIHRoZSBtYXRjaGluZyBjb3VudGVycGFydCBub2RlLiBXaGVuIHRoaXMgY2FuJ3QgYmUgZm91bmQsIGl0IHVzZXMgYGdldEluc3RhbmNlQ291bnRlcnBhcnRVc2luZ0xvY2F0aW9uKClgLlxyXG4gKiBAcGFyYW0ge1NjZW5lTm9kZSAmIENoaWxkcmVuTWl4aW4gfSBub2RlIEEgbm9kZSB3aXRoIGNoaWxkcmVuXHJcbiAqIEByZXR1cm5zIFJldHVybnMgdGhlIGNvdW50ZXJwYXJ0IGNvbXBvbmVudCBub2RlXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRJbnN0YW5jZUNvdW50ZXJwYXJ0KG5vZGUpIHtcclxuICAgIC8vIFRoaXMgc3BsaXRzIHRoZSBpZGUgb2YgdGhlIHNlbGVjdGVkIG5vZGUgYW5kIHVzZXMgdGhlIGxhc3QgcGFydCB3aGljaCBpcyB0aGUgaWQgb2YgdGhlIGNvdW50ZXJwYXJ0IG5vZGUuIFRoZW4gaXQgZmluZHMgdGhpcyBpbiB0aGUgZG9jdW1lbnQuXHJcbiAgICBpZiAoaXNJbnNpZGVJbnN0YW5jZShub2RlKSkge1xyXG4gICAgICAgIHZhciBjaGlsZCA9IGZpZ21hLmdldE5vZGVCeUlkKG5vZGUuaWQuc3BsaXQoJzsnKS5zbGljZSgtMSlbMF0pO1xyXG4gICAgICAgIGlmIChjaGlsZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gY2hpbGQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhub2RlLm5hbWUpXHJcbiAgICAgICAgICAgIC8vIGZpZ21hLmNsb3NlUGx1Z2luKFwiRG9lcyBub3Qgd29yayB3aXRoIHJlbW90ZSBjb21wb25lbnRzXCIpXHJcbiAgICAgICAgICAgIC8vIElmIGNhbid0IGZpbmQgbm9kZSBpbiBkb2N1bWVudCAoYmVjYXVzZSByZW1vdGUgbGlicmFyeSlcclxuICAgICAgICAgICAgZ2V0UGFyZW50SW5zdGFuY2Uobm9kZSk7XHJcbiAgICAgICAgICAgIC8vIHZhciBtYWluQ29tcG9uZW50ID0gcGFyZW50SW5zdGFuY2UubWFpbkNvbXBvbmVudFxyXG4gICAgICAgICAgICByZXR1cm4gZ2V0SW5zdGFuY2VDb3VudGVycGFydFVzaW5nTG9jYXRpb24obm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XG5cbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBkZXB0aCBvZiBhIG5vZGUgcmVsYXRpdmUgdG8gaXRzIGNvbnRhaW5lclxyXG4gKiBAcGFyYW0ge1NjZW5lTm9kZX0gbm9kZSBBIG5vZGVcclxuICogQHJldHVybnMgQW4gaW50ZWdlciB3aGljaCByZXByZXNlbnRzIHRoZSBkZXB0aFxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0Tm9kZURlcHRoKG5vZGUsIGNvbnRhaW5lciA9IGZpZ21hLmN1cnJlbnRQYWdlLCBkZXB0aCA9IDApIHtcclxuICAgIGlmIChub2RlKSB7XHJcbiAgICAgICAgaWYgKG5vZGUuaWQgPT09IGNvbnRhaW5lci5pZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZGVwdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBkZXB0aCArPSAxO1xyXG4gICAgICAgICAgICByZXR1cm4gZ2V0Tm9kZURlcHRoKG5vZGUucGFyZW50LCBjb250YWluZXIsIGRlcHRoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cblxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGNsb3Nlc3QgcGFyZW50IHdoaWNoIGlzbid0IGEgZ3JvdXBcclxuICogQHBhcmFtIHtTY2VuZU5vZGV9IG5vZGUgQSBub2RlXHJcbiAqIEByZXR1cm5zIFJldHVybnMgYSBub2RlXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXROb25lR3JvdXBQYXJlbnQobm9kZSkge1xyXG4gICAgdmFyIF9hLCBfYiwgX2M7XHJcbiAgICBpZiAoKChfYSA9IG5vZGUucGFyZW50KSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EudHlwZSkgPT09IFwiQk9PTEVBTl9PUEVSQVRJT05cIlxyXG4gICAgICAgIHx8ICgoX2IgPSBub2RlLnBhcmVudCkgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLnR5cGUpID09PSBcIkNPTVBPTkVOVF9TRVRcIlxyXG4gICAgICAgIHx8ICgoX2MgPSBub2RlLnBhcmVudCkgPT09IG51bGwgfHwgX2MgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9jLnR5cGUpID09PSBcIkdST1VQXCIpIHtcclxuICAgICAgICByZXR1cm4gZ2V0Tm9uZUdyb3VwUGFyZW50KG5vZGUucGFyZW50KTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBub2RlLnBhcmVudDtcclxuICAgIH1cclxufVxuXG5jb25zdCBub2RlVG9PYmplY3QgPSAobm9kZSwgb3B0aW9ucykgPT4ge1xyXG4gICAgY29uc3QgcHJvcHMgPSBPYmplY3QuZW50cmllcyhPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhub2RlLl9fcHJvdG9fXykpO1xyXG4gICAgY29uc3QgYmxhY2tsaXN0ID0gW1xyXG4gICAgICAgIFwicGFyZW50XCIsXHJcbiAgICAgICAgXCJjaGlsZHJlblwiLFxyXG4gICAgICAgIFwicmVtb3ZlZFwiLFxyXG4gICAgICAgIFwibWFzdGVyQ29tcG9uZW50XCIsXHJcbiAgICAgICAgXCJob3Jpem9udGFsUGFkZGluZ1wiLFxyXG4gICAgICAgIFwidmVydGljYWxQYWRkaW5nXCIsXHJcbiAgICBdO1xyXG4gICAgY29uc3Qgb2JqID0geyBpZDogbm9kZS5pZCwgdHlwZTogbm9kZS50eXBlIH07XHJcbiAgICBmb3IgKGNvbnN0IFtuYW1lLCBwcm9wXSBvZiBwcm9wcykge1xyXG4gICAgICAgIGlmIChwcm9wLmdldCAmJiAhYmxhY2tsaXN0LmluY2x1ZGVzKG5hbWUpKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG9ialtuYW1lXSA9PT0gXCJzeW1ib2xcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIG9ialtuYW1lXSA9IFwiTWl4ZWRcIjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG9ialtuYW1lXSA9IHByb3AuZ2V0LmNhbGwobm9kZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICAgICAgb2JqW25hbWVdID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKG5vZGUucGFyZW50ICYmICEob3B0aW9ucyA9PT0gbnVsbCB8fCBvcHRpb25zID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvcHRpb25zLndpdGhvdXRSZWxhdGlvbnMpKSB7XHJcbiAgICAgICAgb2JqLnBhcmVudCA9IHsgaWQ6IG5vZGUucGFyZW50LmlkLCB0eXBlOiBub2RlLnBhcmVudC50eXBlIH07XHJcbiAgICB9XHJcbiAgICBpZiAobm9kZS5jaGlsZHJlbiAmJiAhKG9wdGlvbnMgPT09IG51bGwgfHwgb3B0aW9ucyA9PT0gdm9pZCAwID8gdm9pZCAwIDogb3B0aW9ucy53aXRob3V0UmVsYXRpb25zKSkge1xyXG4gICAgICAgIG9iai5jaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW4ubWFwKChjaGlsZCkgPT4gbm9kZVRvT2JqZWN0KGNoaWxkLCBvcHRpb25zKSk7XHJcbiAgICB9XHJcbiAgICBpZiAobm9kZS5tYXN0ZXJDb21wb25lbnQgJiYgIShvcHRpb25zID09PSBudWxsIHx8IG9wdGlvbnMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9wdGlvbnMud2l0aG91dFJlbGF0aW9ucykpIHtcclxuICAgICAgICBvYmoubWFzdGVyQ29tcG9uZW50ID0gbm9kZVRvT2JqZWN0KG5vZGUubWFzdGVyQ29tcG9uZW50LCBvcHRpb25zKTtcclxuICAgIH1cclxuICAgIGlmICghKG9wdGlvbnMgPT09IG51bGwgfHwgb3B0aW9ucyA9PT0gdm9pZCAwID8gdm9pZCAwIDogb3B0aW9ucy5yZW1vdmVDb25mbGljdHMpKSB7XHJcbiAgICAgICAgIW9iai5maWxsU3R5bGVJZCAmJiBvYmouZmlsbHMgPyBkZWxldGUgb2JqLmZpbGxTdHlsZUlkIDogZGVsZXRlIG9iai5maWxscztcclxuICAgICAgICAhb2JqLnN0cm9rZVN0eWxlSWQgJiYgb2JqLnN0cm9rZXNcclxuICAgICAgICAgICAgPyBkZWxldGUgb2JqLnN0cm9rZVN0eWxlSWRcclxuICAgICAgICAgICAgOiBkZWxldGUgb2JqLnN0cm9rZXM7XHJcbiAgICAgICAgIW9iai5iYWNrZ3JvdW5kU3R5bGVJZCAmJiBvYmouYmFja2dyb3VuZHNcclxuICAgICAgICAgICAgPyBkZWxldGUgb2JqLmJhY2tncm91bmRTdHlsZUlkXHJcbiAgICAgICAgICAgIDogZGVsZXRlIG9iai5iYWNrZ3JvdW5kcztcclxuICAgICAgICAhb2JqLmVmZmVjdFN0eWxlSWQgJiYgb2JqLmVmZmVjdHNcclxuICAgICAgICAgICAgPyBkZWxldGUgb2JqLmVmZmVjdFN0eWxlSWRcclxuICAgICAgICAgICAgOiBkZWxldGUgb2JqLmVmZmVjdHM7XHJcbiAgICAgICAgIW9iai5ncmlkU3R5bGVJZCAmJiBvYmoubGF5b3V0R3JpZHNcclxuICAgICAgICAgICAgPyBkZWxldGUgb2JqLmdyaWRTdHlsZUlkXHJcbiAgICAgICAgICAgIDogZGVsZXRlIG9iai5sYXlvdXRHcmlkcztcclxuICAgICAgICBpZiAob2JqLnRleHRTdHlsZUlkKSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBvYmouZm9udE5hbWU7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBvYmouZm9udFNpemU7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBvYmoubGV0dGVyU3BhY2luZztcclxuICAgICAgICAgICAgZGVsZXRlIG9iai5saW5lSGVpZ2h0O1xyXG4gICAgICAgICAgICBkZWxldGUgb2JqLnBhcmFncmFwaEluZGVudDtcclxuICAgICAgICAgICAgZGVsZXRlIG9iai5wYXJhZ3JhcGhTcGFjaW5nO1xyXG4gICAgICAgICAgICBkZWxldGUgb2JqLnRleHRDYXNlO1xyXG4gICAgICAgICAgICBkZWxldGUgb2JqLnRleHREZWNvcmF0aW9uO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZGVsZXRlIG9iai50ZXh0U3R5bGVJZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9iai5jb3JuZXJSYWRpdXMgIT09IGZpZ21hLm1peGVkKSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBvYmoudG9wTGVmdFJhZGl1cztcclxuICAgICAgICAgICAgZGVsZXRlIG9iai50b3BSaWdodFJhZGl1cztcclxuICAgICAgICAgICAgZGVsZXRlIG9iai5ib3R0b21MZWZ0UmFkaXVzO1xyXG4gICAgICAgICAgICBkZWxldGUgb2JqLmJvdHRvbVJpZ2h0UmFkaXVzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZGVsZXRlIG9iai5jb3JuZXJSYWRpdXM7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gUGx1Z2luRGF0YVxyXG4gICAgaWYgKChvcHRpb25zID09PSBudWxsIHx8IG9wdGlvbnMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9wdGlvbnMucGx1Z2luRGF0YSkgJiYgbm9kZS5nZXRQbHVnaW5EYXRhS2V5cygpLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBvYmoucGx1Z2luRGF0YSA9IHt9O1xyXG4gICAgICAgIG5vZGUuZ2V0UGx1Z2luRGF0YUtleXMoKS5mb3JFYWNoKChrZXkpID0+IHtcclxuICAgICAgICAgICAgb2JqLnBsdWdpbkRhdGFba2V5XSA9IG5vZGUuZ2V0UGx1Z2luRGF0YShrZXkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG9iai5wbHVnaW5EYXRhKS5sZW5ndGggPT09IDBcclxuICAgICAgICAgICAgPyBkZWxldGUgb2JqLnBsdWdpbkRhdGFcclxuICAgICAgICAgICAgOiBudWxsO1xyXG4gICAgfVxyXG4gICAgLy8gU2hhcmVkIFBsdWdpbiBEYXRhXHJcbiAgICBpZiAob3B0aW9ucyA9PT0gbnVsbCB8fCBvcHRpb25zID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvcHRpb25zLnNoYXJlZFBsdWdpbkRhdGFOYW1lc3BhY2VzKSB7XHJcbiAgICAgICAgb2JqLnNoYXJlZFBsdWdpbkRhdGEgPSB7fTtcclxuICAgICAgICBvcHRpb25zID09PSBudWxsIHx8IG9wdGlvbnMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9wdGlvbnMuc2hhcmVkUGx1Z2luRGF0YU5hbWVzcGFjZXMuZm9yRWFjaCgobmFtZXNwYWNlKSA9PiB7XHJcbiAgICAgICAgICAgIG9iai5zaGFyZWRQbHVnaW5EYXRhW25hbWVzcGFjZV0gPSB7fTtcclxuICAgICAgICAgICAgbm9kZS5nZXRTaGFyZWRQbHVnaW5EYXRhS2V5cyhuYW1lc3BhY2UpLmZvckVhY2goKGtleSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgb2JqLnNoYXJlZFBsdWdpbkRhdGFbbmFtZXNwYWNlXVtrZXldID0gbm9kZS5nZXRTaGFyZWRQbHVnaW5EYXRhKG5hbWVzcGFjZSwga2V5KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG9iai5zaGFyZWRQbHVnaW5EYXRhW25hbWVzcGFjZV0pLmxlbmd0aCA9PT0gMFxyXG4gICAgICAgICAgICAgICAgPyBkZWxldGUgb2JqLnNoYXJlZFBsdWdpbkRhdGFbbmFtZXNwYWNlXVxyXG4gICAgICAgICAgICAgICAgOiBudWxsO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG9iai5zaGFyZWRQbHVnaW5EYXRhKS5sZW5ndGggPT09IDBcclxuICAgICAgICAgICAgPyBkZWxldGUgb2JqLnNoYXJlZFBsdWdpbkRhdGFcclxuICAgICAgICAgICAgOiBudWxsO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG9iajtcclxufTtcblxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG92ZXJyaWRlcyBmb3IgYSBzcGVjaWZpYyBub2RlIGluc2lkZSBhbiBpbnN0YW5jZVxyXG4gKiBAcGFyYW0ge1NjZW5lTm9kZX0gbm9kZSBBIHNwZWNpZmljIG5vZGUgeW91IHdhbnQgb3ZlcnJpZGVzIGZvclxyXG4gKiBAcGFyYW0ge1NjZW5lTm9kZX0gcHJvcCBBIHNwZWNpZmljIHByb3AgeW91IHdhbnQgdG8gZ2V0IG92ZXJyaWRlcyBmb3JcclxuICogQHJldHVybnMgUmV0dXJucyBhbiBvYmplY3Qgb2YgcHJvcGVydGllcy4gSWYgeW91IHByb3ZpZGUgYSBwcm9wIGl0IHdpbGwgcHJvdmlkZSBhIHZhbHVlLlxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0T3ZlcnJpZGVzKG5vZGUsIHByb3ApIHtcclxuICAgIGlmIChpc0luc2lkZUluc3RhbmNlKG5vZGUpKSB7XHJcbiAgICAgICAgdmFyIGNvbXBvbmVudE5vZGUgPSBnZXRJbnN0YW5jZUNvdW50ZXJwYXJ0KG5vZGUpO1xyXG4gICAgICAgIHZhciBwcm9wZXJ0aWVzID0gbm9kZVRvT2JqZWN0KG5vZGUpO1xyXG4gICAgICAgIHZhciBvdmVycmlkZGVuUHJvcHMgPSB7fTtcclxuICAgICAgICBpZiAocHJvcCkge1xyXG4gICAgICAgICAgICBpZiAocHJvcCAhPT0gXCJrZXlcIlxyXG4gICAgICAgICAgICAgICAgJiYgcHJvcCAhPT0gXCJtYWluQ29tcG9uZW50XCJcclxuICAgICAgICAgICAgICAgICYmIHByb3AgIT09IFwiYWJzb2x1dGVUcmFuc2Zvcm1cIlxyXG4gICAgICAgICAgICAgICAgJiYgcHJvcCAhPT0gXCJ0eXBlXCJcclxuICAgICAgICAgICAgICAgICYmIHByb3AgIT09IFwiaWRcIlxyXG4gICAgICAgICAgICAgICAgJiYgcHJvcCAhPT0gXCJwYXJlbnRcIlxyXG4gICAgICAgICAgICAgICAgJiYgcHJvcCAhPT0gXCJjaGlsZHJlblwiXHJcbiAgICAgICAgICAgICAgICAmJiBwcm9wICE9PSBcIm1hc3RlckNvbXBvbmVudFwiXHJcbiAgICAgICAgICAgICAgICAmJiBwcm9wICE9PSBcIm1haW5Db21wb25lbnRcIlxyXG4gICAgICAgICAgICAgICAgJiYgcHJvcCAhPT0gXCJob3Jpem9udGFsUGFkZGluZ1wiXHJcbiAgICAgICAgICAgICAgICAmJiBwcm9wICE9PSBcInZlcnRpY2FsUGFkZGluZ1wiXHJcbiAgICAgICAgICAgICAgICAmJiBwcm9wICE9PSBcInJlYWN0aW9uc1wiXHJcbiAgICAgICAgICAgICAgICAmJiBwcm9wICE9PSBcIm92ZXJsYXlQb3NpdGlvblR5cGVcIlxyXG4gICAgICAgICAgICAgICAgJiYgcHJvcCAhPT0gXCJvdmVyZmxvd0RpcmVjdGlvblwiXHJcbiAgICAgICAgICAgICAgICAmJiBwcm9wICE9PSBcIm51bWJlck9mRml4ZWRDaGlsZHJlblwiXHJcbiAgICAgICAgICAgICAgICAmJiBwcm9wICE9PSBcIm92ZXJsYXlCYWNrZ3JvdW5kXCJcclxuICAgICAgICAgICAgICAgICYmIHByb3AgIT09IFwib3ZlcmxheUJhY2tncm91bmRJbnRlcmFjdGlvblwiXHJcbiAgICAgICAgICAgICAgICAmJiBwcm9wICE9PSBcInJlbW90ZVwiXHJcbiAgICAgICAgICAgICAgICAmJiBwcm9wICE9PSBcImRlZmF1bHRWYXJpYW50XCJcclxuICAgICAgICAgICAgICAgICYmIHByb3AgIT09IFwiaGFzTWlzc2luZ0ZvbnRcIlxyXG4gICAgICAgICAgICAgICAgJiYgcHJvcCAhPT0gXCJleHBvcnRTZXR0aW5nc1wiXHJcbiAgICAgICAgICAgICAgICAmJiBwcm9wICE9PSBcImF1dG9SZW5hbWVcIikge1xyXG4gICAgICAgICAgICAgICAgaWYgKEpTT04uc3RyaW5naWZ5KG5vZGVbcHJvcF0pICE9PSBKU09OLnN0cmluZ2lmeShjb21wb25lbnROb2RlW3Byb3BdKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBub2RlW3Byb3BdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMocHJvcGVydGllcykpIHtcclxuICAgICAgICAgICAgICAgIGlmIChrZXkgIT09IFwia2V5XCJcclxuICAgICAgICAgICAgICAgICAgICAmJiBrZXkgIT09IFwibWFpbkNvbXBvbmVudFwiXHJcbiAgICAgICAgICAgICAgICAgICAgJiYga2V5ICE9PSBcImFic29sdXRlVHJhbnNmb3JtXCJcclxuICAgICAgICAgICAgICAgICAgICAmJiBrZXkgIT09IFwidHlwZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgJiYga2V5ICE9PSBcImlkXCJcclxuICAgICAgICAgICAgICAgICAgICAmJiBrZXkgIT09IFwicGFyZW50XCJcclxuICAgICAgICAgICAgICAgICAgICAmJiBrZXkgIT09IFwiY2hpbGRyZW5cIlxyXG4gICAgICAgICAgICAgICAgICAgICYmIGtleSAhPT0gXCJtYXN0ZXJDb21wb25lbnRcIlxyXG4gICAgICAgICAgICAgICAgICAgICYmIGtleSAhPT0gXCJtYWluQ29tcG9uZW50XCJcclxuICAgICAgICAgICAgICAgICAgICAmJiBrZXkgIT09IFwiaG9yaXpvbnRhbFBhZGRpbmdcIlxyXG4gICAgICAgICAgICAgICAgICAgICYmIGtleSAhPT0gXCJ2ZXJ0aWNhbFBhZGRpbmdcIlxyXG4gICAgICAgICAgICAgICAgICAgICYmIGtleSAhPT0gXCJyZWFjdGlvbnNcIlxyXG4gICAgICAgICAgICAgICAgICAgICYmIGtleSAhPT0gXCJvdmVybGF5UG9zaXRpb25UeXBlXCJcclxuICAgICAgICAgICAgICAgICAgICAmJiBrZXkgIT09IFwib3ZlcmZsb3dEaXJlY3Rpb25cIlxyXG4gICAgICAgICAgICAgICAgICAgICYmIGtleSAhPT0gXCJudW1iZXJPZkZpeGVkQ2hpbGRyZW5cIlxyXG4gICAgICAgICAgICAgICAgICAgICYmIGtleSAhPT0gXCJvdmVybGF5QmFja2dyb3VuZFwiXHJcbiAgICAgICAgICAgICAgICAgICAgJiYga2V5ICE9PSBcIm92ZXJsYXlCYWNrZ3JvdW5kSW50ZXJhY3Rpb25cIlxyXG4gICAgICAgICAgICAgICAgICAgICYmIGtleSAhPT0gXCJyZW1vdGVcIlxyXG4gICAgICAgICAgICAgICAgICAgICYmIGtleSAhPT0gXCJkZWZhdWx0VmFyaWFudFwiXHJcbiAgICAgICAgICAgICAgICAgICAgJiYga2V5ICE9PSBcImhhc01pc3NpbmdGb250XCJcclxuICAgICAgICAgICAgICAgICAgICAmJiBrZXkgIT09IFwiZXhwb3J0U2V0dGluZ3NcIlxyXG4gICAgICAgICAgICAgICAgICAgICYmIGtleSAhPT0gXCJhdXRvUmVuYW1lXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoSlNPTi5zdHJpbmdpZnkocHJvcGVydGllc1trZXldKSAhPT0gSlNPTi5zdHJpbmdpZnkoY29tcG9uZW50Tm9kZVtrZXldKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdmVycmlkZGVuUHJvcHNba2V5XSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoSlNPTi5zdHJpbmdpZnkob3ZlcnJpZGRlblByb3BzKSA9PT0gXCJ7fVwiKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3ZlcnJpZGRlblByb3BzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XG5cbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBwYWdlIG5vZGUgb2YgdGhlIHNlbGVjdGVkIG5vZGVcclxuICogQHBhcmFtIHtTY2VuZU5vZGV9IG5vZGUgQSBub2RlXHJcbiAqIEByZXR1cm5zIFRoZSBwYWdlIG5vZGVcclxuICovXHJcbmZ1bmN0aW9uIGdldFBhZ2VOb2RlKG5vZGUpIHtcclxuICAgIGlmIChub2RlLnBhcmVudC50eXBlID09PSBcIlBBR0VcIikge1xyXG4gICAgICAgIHJldHVybiBub2RlLnBhcmVudDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBnZXRQYWdlTm9kZShub2RlLnBhcmVudCk7XHJcbiAgICB9XHJcbn1cblxuLyoqXHJcbiAqIFJldHVybnMgdGhlIHRvcCBtb3N0IGluc3RhbmNlIHRoYXQgYSBub2RlIGJlbG9uZ3MgdG9cclxuICogQHBhcmFtIHtTY2VuZU5vZGV9IG5vZGUgQSBub2RlXHJcbiAqIEByZXR1cm5zIFRoZSB0b3AgbW9zdCBpbnN0YW5jZSBub2RlXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRUb3BJbnN0YW5jZShub2RlKSB7XHJcbiAgICBpZiAobm9kZS50eXBlID09PSBcIlBBR0VcIilcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIGlmIChpc0luc2lkZUluc3RhbmNlKG5vZGUpKSB7XHJcbiAgICAgICAgaWYgKGlzSW5zaWRlSW5zdGFuY2Uobm9kZS5wYXJlbnQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBnZXRUb3BJbnN0YW5jZShub2RlLnBhcmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbm9kZS5wYXJlbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XG5cbi8vIFRPRE86IENyZWF0ZSBhIHJlcGxhY2VOb2RlIGhlbHBlclxyXG4vKipcclxuICogTWFrZXMgYW55IHNlbGVjdGlvbiBvZiBub2RlcyBhIGNvbXBvbmVudCwgdGhlIHNhbWUgYXMgaXQgaGFwcGVucyBpbiB0aGUgZWRpdG9yXHJcbiAqIEBwYXJhbSB7U2NlbmVOb2RlfSBub2RlIFRoZSBub2RlIHlvdSB3YW50IHRvIG1ha2UgaW50byBhIGNvbXBvbmVudFxyXG4gKiBAcmV0dXJucyBSZXR1cm5zIHRoZSBuZXcgbm9kZSBhcyBhIGNvbXBvbmVudFxyXG4gKi9cclxuZnVuY3Rpb24gbWFrZUNvbXBvbmVudChub2Rlcykge1xyXG4gICAgLy8gSWYgbm90IGdpdmVuIGFuIGFycmF5LCBwdXQgaW50byBhbiBhcnJheVxyXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KG5vZGVzKSkge1xyXG4gICAgICAgIG5vZGVzID0gW25vZGVzXTtcclxuICAgIH1cclxuICAgIGxldCBwYXJlbnQgPSBub2Rlc1swXS5wYXJlbnQ7XHJcbiAgICBpZiAobm9kZXMubGVuZ3RoID09PSAxICYmIChub2Rlc1swXS50eXBlID09PSBcIkZSQU1FXCIgfHwgbm9kZXNbMF0udHlwZSA9PT0gXCJHUk9VUFwiKSkge1xyXG4gICAgICAgIC8vIGxldCBub2RlSW5kZXggPSBnZXROb2RlSW5kZXgobm9kZXNbMF0pXHJcbiAgICAgICAgbGV0IGNvbXBvbmVudCA9IGNvbnZlcnRUb0NvbXBvbmVudChub2Rlc1swXSk7XHJcbiAgICAgICAgLy8gcGFyZW50Lmluc2VydENoaWxkKG5vZGVJbmRleCwgY29tcG9uZW50KVxyXG4gICAgICAgIHJldHVybiBjb21wb25lbnQ7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBsZXQgY29tcG9uZW50ID0gZmlnbWEuY3JlYXRlQ29tcG9uZW50KCk7XHJcbiAgICAgICAgbGV0IGdyb3VwID0gZmlnbWEuZ3JvdXAobm9kZXMsIHBhcmVudCk7XHJcbiAgICAgICAgY29tcG9uZW50LnJlc2l6ZVdpdGhvdXRDb25zdHJhaW50cyhncm91cC53aWR0aCwgZ3JvdXAuaGVpZ2h0KTtcclxuICAgICAgICBjb3B5UGFzdGUoZ3JvdXAsIGNvbXBvbmVudCwgeyBpbmNsdWRlOiBbJ3gnLCAneSddIH0pO1xyXG4gICAgICAgIGdyb3VwLnggPSAwO1xyXG4gICAgICAgIGdyb3VwLnkgPSAwO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwid2hlcmUgdGhlIGNoaWxkcmVuIGdvXCIpO1xyXG4gICAgICAgIGlmIChub2Rlcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgY29tcG9uZW50Lm5hbWUgPSBub2Rlc1swXS5uYW1lO1xyXG4gICAgICAgIH1cclxuICAgICAgICB1bmdyb3VwKGdyb3VwLCBjb21wb25lbnQpO1xyXG4gICAgICAgIHJldHVybiBjb21wb25lbnQ7XHJcbiAgICB9XHJcbn1cblxuZnVuY3Rpb24gaXNGdW5jdGlvbihmdW5jdGlvblRvQ2hlY2spIHtcclxuICAgIHJldHVybiAoZnVuY3Rpb25Ub0NoZWNrICYmIHt9LnRvU3RyaW5nLmNhbGwoZnVuY3Rpb25Ub0NoZWNrKSA9PT0gXCJbb2JqZWN0IEZ1bmN0aW9uXVwiKTtcclxufVxyXG4vLyBUT0RPOiBBZGQgb3B0aW9uIHRvIGlnbm9yZSB3aWR0aCBhbmQgaGVpZ2h0P1xyXG4vLyBUT0RPOiBDb3VsZCBkbyB3aXRoIHJlZmFjdG9yaW5nXHJcbi8qKlxyXG4gKiBSZXBsYWNlIGFueSBub2RlIHdpdGggYW5vdGhlciBub2RlXHJcbiAqIEBwYXJhbSB7U2NlbmVOb2RlfSB0YXJnZXQgVGhlIG5vZGUgeW91IHdhbnQgdG8gcmVwbGFjZVxyXG4gKiBAcGFyYW0ge1NjZW5lTm9kZSB8IENhbGxiYWNrfSBzb3VyY2UgV2hhdCB5b3Ugd2FudCB0byByZXBsYWNlIHRoZSBub2RlIHdpdGhcclxuICogQHJldHVybnMgUmV0dXJucyB0aGUgbmV3IG5vZGUgYXMgYSBjb21wb25lbnRcclxuICovXHJcbmZ1bmN0aW9uIHJlcGxhY2UodGFyZ2V0LCBzb3VyY2UpIHtcclxuICAgIGxldCBpc1NlbGVjdGlvbiA9IGZhbHNlO1xyXG4gICAgbGV0IHRhcmdldENvcHk7XHJcbiAgICBsZXQgY2xvbmVkU2VsZWN0aW9uID0gW107XHJcbiAgICBsZXQgbm9kZUluZGV4O1xyXG4gICAgbGV0IHBhcmVudDtcclxuICAgIC8vIElmIGl0J3MgYSBzZWxlY3Rpb24gd2UgbmVlZCB0byBjcmVhdGUgYSBkdW1teSBub2RlIHRoYXQgcmVwcmVzZW50cyB0aGUgd2hvbGUgb2YgdGhlIHNlbGVjdGlvbiB0byBiYXNlIHRoZSBwcm9wZXJ0aWVzIG9mZlxyXG4gICAgaWYgKEFycmF5LmlzQXJyYXkodGFyZ2V0KSkge1xyXG4gICAgICAgIG5vZGVJbmRleCA9IGdldE5vZGVJbmRleCh0YXJnZXRbMF0pO1xyXG4gICAgICAgIHBhcmVudCA9IHRhcmdldFswXS5wYXJlbnQ7XHJcbiAgICAgICAgLy8gQ2xvbmUgdGhlIHRhcmdldCBzbyB0aGUgYWN0dWFsIHRhcmdldCBkb2Vzbid0IG1vdmVcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRhcmdldC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgY2xvbmUgPSB0YXJnZXRbaV0uY2xvbmUoKTtcclxuICAgICAgICAgICAgY2xvbmVkU2VsZWN0aW9uLnB1c2goY2xvbmUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBwYXJlbnQuaW5zZXJ0Q2hpbGQoY2xvbmUsIG5vZGVJbmRleClcclxuICAgICAgICB0YXJnZXRDb3B5ID0gZmlnbWEuZ3JvdXAoY2xvbmVkU2VsZWN0aW9uLCBwYXJlbnQsIG5vZGVJbmRleCk7XHJcbiAgICAgICAgLy8gSSB0aGluayB0aGlzIG5lZWRzIHRvIGhhcHBlbiBiZWNhdXNlIHdoZW4geW91IGNyZWF0ZSBhIGNsb25lIGl0IGRvZXNuJ3QgZ2V0IGluc2VydGVkIGludG8gdGhlIHNhbWUgbG9jYXRpb24gYXMgdGhlIG9yaWdpbmFsIG5vZGU/XHJcbiAgICAgICAgdGFyZ2V0Q29weS54ID0gdGFyZ2V0WzBdLng7XHJcbiAgICAgICAgdGFyZ2V0Q29weS55ID0gdGFyZ2V0WzBdLnk7XHJcbiAgICAgICAgaXNTZWxlY3Rpb24gPSB0cnVlO1xyXG4gICAgICAgIG5vZGVJbmRleCA9IGdldE5vZGVJbmRleCh0YXJnZXRDb3B5KTtcclxuICAgICAgICBwYXJlbnQgPSB0YXJnZXRDb3B5LnBhcmVudDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHRhcmdldENvcHkgPSBub2RlVG9PYmplY3QodGFyZ2V0KTtcclxuICAgICAgICBub2RlSW5kZXggPSBnZXROb2RlSW5kZXgodGFyZ2V0KTtcclxuICAgICAgICBwYXJlbnQgPSB0YXJnZXQucGFyZW50O1xyXG4gICAgfVxyXG4gICAgbGV0IHRhcmdldFdpZHRoID0gdGFyZ2V0Q29weS53aWR0aDtcclxuICAgIGxldCB0YXJnZXRIZWlnaHQgPSB0YXJnZXRDb3B5LmhlaWdodDtcclxuICAgIGxldCByZXN1bHQ7XHJcbiAgICBpZiAoaXNGdW5jdGlvbihzb3VyY2UpKSB7XHJcbiAgICAgICAgcmVzdWx0ID0gc291cmNlKHRhcmdldCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXN1bHQgPSBzb3VyY2U7XHJcbiAgICB9XHJcbiAgICBpZiAocmVzdWx0KSB7XHJcbiAgICAgICAgLy8gRklYTUU6IEFkZCB0aGlzIGludG8gY29weVBhc3RlIGhlbHBlclxyXG4gICAgICAgIHJlc3VsdC5yZXNpemVXaXRob3V0Q29uc3RyYWludHModGFyZ2V0V2lkdGgsIHRhcmdldEhlaWdodCk7XHJcbiAgICAgICAgY29weVBhc3RlKHRhcmdldENvcHksIHJlc3VsdCwgeyBpbmNsdWRlOiBbXCJ4XCIsIFwieVwiLCBcImNvbnN0cmFpbnRzXCJdIH0pO1xyXG4gICAgICAgIC8vIGNvcHlQYXN0ZSBub3Qgd29ya2luZyBwcm9wZXJseSBzbyBoYXZlIHRvIG1hbnVhbGx5IGNvcHkgeCBhbmQgeVxyXG4gICAgICAgIHJlc3VsdC54ID0gdGFyZ2V0Q29weS54O1xyXG4gICAgICAgIHJlc3VsdC55ID0gdGFyZ2V0Q29weS55O1xyXG4gICAgICAgIHBhcmVudC5pbnNlcnRDaGlsZChub2RlSW5kZXgsIHJlc3VsdCk7XHJcbiAgICAgICAgaWYgKGlzU2VsZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIHRhcmdldENvcHkucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIC8vIGNsb25lZFNlbGVjdGlvbiBnZXRzIHJlbW92ZWQgd2hlbiB0aGlzIG5vZGUgZ2V0cyByZW1vdmVkXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChmaWdtYS5nZXROb2RlQnlJZCh0YXJnZXQuaWQpKSB7XHJcbiAgICAgICAgICAgIHRhcmdldC5yZW1vdmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxufVxuXG4vKipcclxuICogQW4gYWxpYXMgZm9yIGBmaWdtYS5yb290YCBwbHVnaW4gZGF0YVxyXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5IEEga2V5IHRvIHN0b3JlIGRhdGEgdW5kZXJcclxuICogQHBhcmFtIHthbnl9IGRhdGEgRGF0YSB0byBiZSBzdG9yZWRcclxuICovXHJcbmZ1bmN0aW9uIHNldERvY3VtZW50RGF0YShrZXksIGRhdGEpIHtcclxuICAgIHJldHVybiBzZXRQbHVnaW5EYXRhKGZpZ21hLnJvb3QsIGtleSwgZGF0YSk7XHJcbn1cclxuLyoqXHJcbiAqIEFuIGFsaWFzIGZvciBgZmlnbWEucm9vdGAgcGx1Z2luIGRhdGFcclxuICogQHBhcmFtIHtTdHJpbmd9IGtleSBBIGtleSB0byBzdG9yZSBkYXRhIHVuZGVyXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXREb2N1bWVudERhdGEoa2V5KSB7XHJcbiAgICByZXR1cm4gZ2V0UGx1Z2luRGF0YShmaWdtYS5yb290LCBrZXkpO1xyXG59XHJcbi8qKlxyXG4gKiBBbiBhbGlhcyBmb3IgYGZpZ21hLnJvb3RgIHBsdWdpbiBkYXRhXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXkgQSBrZXkgdG8gc3RvcmUgZGF0YSB1bmRlclxyXG4gKi9cclxuZnVuY3Rpb24gdXBkYXRlRG9jdW1lbnREYXRhKG5vZGUsIGtleSwgY2FsbGJhY2spIHtcclxuICAgIHJldHVybiB1cGRhdGVQbHVnaW5EYXRhKG5vZGUsIGtleSwgY2FsbGJhY2spO1xyXG59XG5cbi8qKlxyXG4gKiBHZW5lcmF0ZXMgYSBVbmlxdWUgSURcclxuICogQHJldHVybnMgQSB1bmlxdWUgaWRlbnRpZmllclxyXG4gKi9cclxuLy8gVE9ETzogVXNlIHdpdGggZmlnbWEuYWN0aXZlVXNlciBzZXNzaW9uIElEXHJcbmZ1bmN0aW9uIGdlblVJRCgpIHtcclxuICAgIC8vIHZhciByYW5kUGFzc3dvcmQgPSBBcnJheSgxMClcclxuICAgIC8vICAgLmZpbGwoXCIwMTIzNDU2Nzg5QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5elwiKVxyXG4gICAgLy8gICAubWFwKGZ1bmN0aW9uICh4KSB7XHJcbiAgICAvLyAgICAgcmV0dXJuIHhbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogeC5sZW5ndGgpXTtcclxuICAgIC8vICAgfSlcclxuICAgIC8vICAgLmpvaW4oXCJcIik7XHJcbiAgICByZXR1cm4gYCR7ZmlnbWEuY3VycmVudFVzZXIuaWQgK1xyXG4gICAgICAgIFwiLVwiICtcclxuICAgICAgICBmaWdtYS5jdXJyZW50VXNlci5zZXNzaW9uSWQgK1xyXG4gICAgICAgIFwiLVwiICtcclxuICAgICAgICBuZXcgRGF0ZSgpLnZhbHVlT2YoKX1gO1xyXG59XG5cbi8qKlxyXG4gKiBTYXZlcyByZWNlbnRseSB2aXNpdGVkIGZpbGVzIHRvIGEgbGlzdCBpbiBjbGllbnRTdG9yYWdlIGFuZCBrZWVwcyB0aGUgZGF0YSBhbmQgbmFtZSB1cCB0byBkYXRlIGVhY2ggdGltZSB0aGV5J3JlIHZpc2l0ZWQuIElmIGEgZmlsZSBpcyBkdXBsaWNhdGVkIGl0IGNvdWxkIGJlIHByb2JsZW1hdGljLiBUaGUgb25seSBzb2x1dGlvbiBpcyBmb3IgdGhlIHVzZXIgdG8gcnVuIHRoZSBwbHVnaW4gd2hlbiB0aGUgZmlsZSBoYXMgYmVlbiBkdXBsaWNhdGVkIHdpdGggdGhlIHN1ZmZpeCBcIihDb3B5KVwiIHN0aWxsIHByZXNlbnQuIFRoZW4gdGhlIHBsdWdpbiB3aWxsIHJlc2V0IHRoZSBmaWxlSWQuXHJcbiAqIEBwYXJhbSB7YW55fSBmaWxlRGF0YSBBbnkgZGF0YSB5b3Ugd2FudCB0byBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIGZpbGVcclxuICogQHJldHVybnMgQW4gYXJyYXkgb2YgZmlsZXMgZXhjbHVkaW5nIHRoZSBjdXJyZW50IGZpbGVcclxuICovXHJcbmZ1bmN0aW9uIGFkZFVuaXF1ZVRvQXJyYXkoYXJyYXksIG9iamVjdCkge1xyXG4gICAgLy8gLy8gT25seSBhZGQgbmV3IHRlbXBsYXRlIGlmIHVuaXF1ZVxyXG4gICAgdmFyIGluZGV4ID0gYXJyYXkuZmluZEluZGV4KCh4KSA9PiB4LmlkID09PSBvYmplY3QuaWQpO1xyXG4gICAgaW5kZXggPT09IC0xID8gYXJyYXkucHVzaChvYmplY3QpIDogZmFsc2U7XHJcbiAgICByZXR1cm4gYXJyYXk7XHJcbn1cclxuZnVuY3Rpb24gaXNVbmlxdWUoYXJyYXksIG9iamVjdCkge1xyXG4gICAgLy8gLy8gT25seSBhZGQgbmV3IHRlbXBsYXRlIGlmIHVuaXF1ZVxyXG4gICAgdmFyIGluZGV4ID0gYXJyYXkuZmluZEluZGV4KCh4KSA9PiB4LmlkID09PSBvYmplY3QuaWQpO1xyXG4gICAgcmV0dXJuIGluZGV4ID09PSAtMSA/IHRydWUgOiBmYWxzZTtcclxufVxyXG5mdW5jdGlvbiBtb3ZlKGFycmF5LCBmcm9tLCB0bywgcmVwbGFjZVdpdGgpIHtcclxuICAgIC8vIFJlbW92ZSBmcm9tIGFycmF5XHJcbiAgICBsZXQgZWxlbWVudCA9IGFycmF5LnNwbGljZShmcm9tLCAxKVswXTtcclxuICAgIC8vIEFkZCB0byBhcnJheVxyXG4gICAgaWYgKHJlcGxhY2VXaXRoKSB7XHJcbiAgICAgICAgYXJyYXkuc3BsaWNlKHRvLCAwLCByZXBsYWNlV2l0aCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBhcnJheS5zcGxpY2UodG8sIDAsIGVsZW1lbnQpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFycmF5O1xyXG59XHJcbmZ1bmN0aW9uIHVwc2VydChhcnJheSwgY2IsIGVudHJ5KSB7XHJcbiAgICBhcnJheS5zb21lKChpdGVtLCBpbmRleCkgPT4ge1xyXG4gICAgICAgIGxldCByZXN1bHQgPSBmYWxzZTtcclxuICAgICAgICBpZiAodHJ1ZSA9PT0gY2IoYXJyYXlbaW5kZXhdKSkge1xyXG4gICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xyXG4gICAgICAgICAgICAvLyBtb3ZlIHRvIHRvcFxyXG4gICAgICAgICAgICBpZiAoZW50cnkpIHtcclxuICAgICAgICAgICAgICAgIG1vdmUoYXJyYXksIGluZGV4LCAwLCBlbnRyeSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBtb3ZlKGFycmF5LCBpbmRleCwgMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coYXJyYXkpO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9KTtcclxuICAgIGxldCBtYXRjaEZvdW5kID0gZmFsc2U7XHJcbiAgICBhcnJheS5tYXAoKGl0ZW0sIGluZGV4KSA9PiB7XHJcbiAgICAgICAgaWYgKHRydWUgPT09IGNiKGFycmF5W2luZGV4XSkpIHtcclxuICAgICAgICAgICAgbWF0Y2hGb3VuZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBpZiAoIW1hdGNoRm91bmQpIHtcclxuICAgICAgICBhcnJheS51bnNoaWZ0KGVudHJ5KTtcclxuICAgIH1cclxuICAgIHJldHVybiBhcnJheTtcclxufVxyXG5mdW5jdGlvbiBGaWxlKGRhdGEpIHtcclxuICAgIHRoaXMuaWQgPVxyXG4gICAgICAgIGdldERvY3VtZW50RGF0YShcImZpbGVJZFwiKSB8fFxyXG4gICAgICAgICAgICBzZXREb2N1bWVudERhdGEoXCJmaWxlSWRcIiwgZ2VuVUlEKCkpLnJlcGxhY2UoL1snXCJdKy9nLCBcIlwiKTtcclxuICAgIC8vIFRPRE86IFdoZW4gZ2V0UGx1Z2luRGF0YSBoYXMgYmVlbiB1cGRhdGVkIHRvIGV2YWx1YXRlIGV4cHJlc3Npb25zIGF0IHJ1bnRpbWUgcmVwbGFjZSB3aXRoIGJlbG93XHJcbiAgICAvLyB0aGlzLm5hbWUgPSBge2ZpZ21hLmdldE5vZGVCeUlkKFwiMDoxXCIpLm5hbWV9YFxyXG4gICAgdGhpcy5uYW1lID0gZmlnbWEucm9vdC5uYW1lO1xyXG4gICAgdGhpcy5maXJzdFZpc2l0ZWQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XHJcbiAgICB0aGlzLmxhc3RWaXNpdGVkID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xyXG4gICAgaWYgKGRhdGEpIHtcclxuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xyXG4gICAgICAgIHNldERvY3VtZW50RGF0YShcImZpbGVEYXRhXCIsIGRhdGEpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZ2V0RG9jdW1lbnREYXRhKFwiZmlsZURhdGFcIik7XHJcbiAgICB9XHJcbn1cclxuYXN5bmMgZnVuY3Rpb24gZ2V0UmVjZW50RmlsZXNBc3luYyhmaWxlRGF0YSwgb3B0cykge1xyXG4gICAgb3B0cyA9IG9wdHMgfHwge307XHJcbiAgICAvLyBTaG91bGQgaXQgaW5jbHVkZSBhbiBvcHRpb24gdG9wIG9ubHkgYWRkIHB1Ymxpc2hlZCBjb21wb25lbnRzL2RhdGE/XHJcbiAgICAvLyBjb25zdCBwdWJsaXNoZWRDb21wb25lbnRzID0gYXdhaXQgZ2V0UHVibGlzaGVkQ29tcG9uZW50cyhmaWxlRGF0YSlcclxuICAgIGZpbGVEYXRhID0gZmlsZURhdGEgfHwgZ2V0RG9jdW1lbnREYXRhKFwiZmlsZURhdGFcIik7XHJcbiAgICBsZXQgcmVjZW50RmlsZXMgPSBhd2FpdCB1cGRhdGVDbGllbnRTdG9yYWdlQXN5bmMoXCJyZWNlbnRGaWxlc1wiLCAocmVjZW50RmlsZXMpID0+IHtcclxuICAgICAgICByZWNlbnRGaWxlcyA9IHJlY2VudEZpbGVzIHx8IFtdO1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRGaWxlID0gbmV3IEZpbGUoZmlsZURhdGEpO1xyXG4gICAgICAgIC8vIFdlIGhhdmUgdG8gY2hlY2sgaWYgdGhlIGFycmF5IGlzIGVtcHR5IGJlY2F1c2Ugd2UgY2FuJ3QgZmlsdGVyIGFuIGVtcHR5IGFycmF5XHJcbiAgICAgICAgaWYgKHJlY2VudEZpbGVzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICBpZiAoZmlsZURhdGEubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgICAgIHJlY2VudEZpbGVzLnB1c2goY3VycmVudEZpbGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy8gQlVHOiBJdCdzIG5vdCBwb3NzaWJsZSB0byBjaGVjayBmb3IgZHVwbGljYXRlcyBiZWNhdXNlIHlvdSB3b3VsZCBuZWVkIHNvbWUgd2F5IHRvIHRlbGwgdGhlbSBhcGFydCwgb3RoZXJ3aXNlIHlvdSBkb24ndCBrbm93IGlmIGl0cyBhIGR1cGxpY2F0ZSBmaWxlIGZvciBqdXN0IHRoZSBzYW1lIGZpbGUuIEkgdHJpZWQgcmVzZXR0aW5nIHRoZSBmaWxlSWQgd2hlbiBpdCB3YXNuJ3QgdW5pcXVlLCBidXQgdGhlbiB3aGVuIGl0IHdhcyBhIGZpbGUgdGhhdCdzIGFscmVhZHkgYmVlbiBhZGRlZCBJIGhhZCBubyB3YXkgb2YgdGVsbGluZyB0aGVtIGFwYXJ0LlxyXG4gICAgICAgICAgICAvLyBUaGlzIGlzIHNvcnQgb2YgbGlrZSBhIGdldCBvdXQgY2xhdXNlLiBJdCBlbmFibGVzIGEgdXNlciB0byByZWdpc3RlciBhIGR1cGxpY2F0ZWQgZmlsZSBpZiBpdHMgdGhlIHNhbWUgdXNlciBhbmQgdGhlIHBsdWdpbiBpcyBydW4gd2hlbiB0aGUgZmlsZSBuYW1lIGVuZHMgaW4gKENvcHkpLlxyXG4gICAgICAgICAgICBpZiAoIWlzVW5pcXVlKHJlY2VudEZpbGVzLCBjdXJyZW50RmlsZSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBbaWQsIHNlc3Npb25JZCwgdGltZXN0YW1wXSA9IGN1cnJlbnRGaWxlLmlkLnNwbGl0KFwiLVwiKTtcclxuICAgICAgICAgICAgICAgIGlmIChpZCA9PT0gZmlnbWEuY3VycmVudFVzZXIuaWQgJiZcclxuICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQgIT09IGZpZ21hLmN1cnJlbnRVc2VyLnNlc3Npb25JZC50b1N0cmluZygpICYmXHJcbiAgICAgICAgICAgICAgICAgICAgZmlnbWEucm9vdC5uYW1lLmVuZHNXaXRoKFwiKENvcHkpXCIpICYmXHJcbiAgICAgICAgICAgICAgICAgICAgIWdldERvY3VtZW50RGF0YShcImR1cGxpY2F0ZVJlc29sdmVkXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEZpbGUuaWQgPSBzZXREb2N1bWVudERhdGEoXCJmaWxlSWRcIiwgZ2VuVUlEKCkpLnJlcGxhY2UoL1snXCJdKy9nLCBcIlwiKTtcclxuICAgICAgICAgICAgICAgICAgICBzZXREb2N1bWVudERhdGEoXCJkdXBsaWNhdGVSZXNvbHZlZFwiLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWZpZ21hLnJvb3QubmFtZS5lbmRzV2l0aChcIihDb3B5KVwiKSkge1xyXG4gICAgICAgICAgICAgICAgc2V0RG9jdW1lbnREYXRhKFwiZHVwbGljYXRlUmVzb2x2ZWRcIiwgXCJcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gSWYgdW5pcXVlIHRoZW4gYWRkIHRvIGFycmF5XHJcbiAgICAgICAgICAgIGFkZFVuaXF1ZVRvQXJyYXkocmVjZW50RmlsZXMsIGN1cnJlbnRGaWxlKTtcclxuICAgICAgICAgICAgaWYgKHJlY2VudEZpbGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIG5vdCwgdGhlbiB1cGRhdGVcclxuICAgICAgICAgICAgICAgIHJlY2VudEZpbGVzLmZpbHRlcigoaXRlbSwgaSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmlkID09PSBjdXJyZW50RmlsZS5pZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLm5hbWUgPSBjdXJyZW50RmlsZS5uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmxhc3RWaXNpdGVkID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmRhdGEgPSBjdXJyZW50RmlsZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXREb2N1bWVudERhdGEoXCJmaWxlRGF0YVwiLCBmaWxlRGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIGRhdGEgbm8gbG9uZ2VyIGV4aXN0cywgZGVsZXRlIHRoZSBmaWxlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZmlsZURhdGEgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChBcnJheS5pc0FycmF5KGZpbGVEYXRhKSAmJiBmaWxlRGF0YS5sZW5ndGggPT09IDApKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNlbnRGaWxlcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vIFNvcnQgYnkgbGFzdFZpc2lzdGVkXHJcbiAgICAgICAgICAgICAgICByZWNlbnRGaWxlcy5zb3J0KChhLCBiKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGEubGFzdFZpc2l0ZWQgPT09IGIubGFzdFZpc2l0ZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIGZpbGVzIGRvbid0IGhhdmUgYSBsYXN0VmlzaXRlZCBkYXRlIHRoZW4ga2VlcCB0aGVtIGF0IHRoZSB0b3Agb2YgdGhlIGxpc3QuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBhLmxhc3RWaXNpdGVkID09PSBcInVuZGVmaW5lZFwiIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVvZiBiLmxhc3RWaXNpdGVkID09PSBcInVuZGVmaW5lZFwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYS5sYXN0VmlzaXRlZCA+IGIubGFzdFZpc2l0ZWQgPyAtMSA6IDE7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlmIChvcHRzLmV4cGlyZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBmaWxlcyB3aGljaCBhcmUgb3V0IG9mIGRhdGVcclxuICAgICAgICAgICAgICAgICAgICByZWNlbnRGaWxlcy5tYXAoKGZpbGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGZpbGVUaW1lc3RhbXAgPSBuZXcgRGF0ZShmaWxlLmxhc3RWaXNpdGVkKS52YWx1ZU9mKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjdXJyZW50VGltZXN0YW1wID0gbmV3IERhdGUoKS52YWx1ZU9mKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIChmaWxlVGltZXN0YW1wIDwgY3VycmVudFRpbWVzdGFtcCAtIGRheXNUb01pbGxpc2Vjb25kcyg3KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZVRpbWVzdGFtcCA8IGN1cnJlbnRUaW1lc3RhbXAgLSBvcHRzLmV4cGlyZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGZpbGVJbmRleCA9IHJlY2VudEZpbGVzLmluZGV4T2YoZmlsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZUluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY2VudEZpbGVzLnNwbGljZShmaWxlSW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAob3B0cy5saW1pdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlY2VudEZpbGVzID0gcmVjZW50RmlsZXMuc2xpY2UoMCwgb3B0cy5saW1pdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlY2VudEZpbGVzO1xyXG4gICAgfSk7XHJcbiAgICBpZiAocmVjZW50RmlsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIC8vIEV4Y2x1ZGUgY3VycmVudCBmaWxlXHJcbiAgICAgICAgcmVjZW50RmlsZXMgPSByZWNlbnRGaWxlcy5maWx0ZXIoKGZpbGUpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuICEoZmlsZS5pZCA9PT0gZ2V0UGx1Z2luRGF0YShmaWdtYS5yb290LCBcImZpbGVJZFwiKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVjZW50RmlsZXM7XHJcbn1cclxuYXN5bmMgZnVuY3Rpb24gYWRkUmVjZW50RmlsZUFzeW5jKGZpbGUpIHtcclxuICAgIHJldHVybiBhd2FpdCB1cGRhdGVDbGllbnRTdG9yYWdlQXN5bmMoXCJyZWNlbnRGaWxlc1wiLCAocmVjZW50RmlsZXMpID0+IHtcclxuICAgICAgICByZWNlbnRGaWxlcyA9IHJlY2VudEZpbGVzIHx8IFtdO1xyXG4gICAgICAgIHJlY2VudEZpbGVzID0gdXBzZXJ0KHJlY2VudEZpbGVzLCAoaXRlbSkgPT4gaXRlbS5pZCA9PT0gZmlsZS5pZCwgZmlsZSk7XHJcbiAgICAgICAgcmV0dXJuIHJlY2VudEZpbGVzO1xyXG4gICAgfSk7XHJcbn1cblxuLyoqXHJcbiAqIFJldHVybnMgYW55IHJlbW90ZSBmaWxlcyBhc3NvY2lhdGVkIHdpdGggdGhlIGN1cnJlbnQgZmlsZSB1c2VkIGJ5IHRoZSBwbHVnaW4gYW5kIGtlZXBzIHRoZSBuYW1lIGFuZCBkYXRhIHVwIHRvIGRhdGUuXHJcbiAqIEByZXR1cm5zIEFuIGFycmF5IG9mIGZpbGVzXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBnZXRSZW1vdGVGaWxlc0FzeW5jKGZpbGVJZCkge1xyXG4gICAgdmFyIHJlY2VudEZpbGVzID0gYXdhaXQgZ2V0Q2xpZW50U3RvcmFnZUFzeW5jKFwicmVjZW50RmlsZXNcIik7XHJcbiAgICByZXR1cm4gdXBkYXRlUGx1Z2luRGF0YShmaWdtYS5yb290LCBcInJlbW90ZUZpbGVzXCIsIChyZW1vdGVGaWxlcykgPT4ge1xyXG4gICAgICAgIHJlbW90ZUZpbGVzID0gcmVtb3RlRmlsZXMgfHwgW107XHJcbiAgICAgICAgLy8gQWRkIG5ldyBmaWxlIHRvIHJlbW90ZSBmaWxlc1xyXG4gICAgICAgIGlmIChmaWxlSWQpIHtcclxuICAgICAgICAgICAgbGV0IGZpbGVBbHJlYWR5RXhpc3RzID0gcmVtb3RlRmlsZXMuZmluZCgoZmlsZSkgPT4gZmlsZS5pZCA9PT0gZmlsZUlkKTtcclxuICAgICAgICAgICAgbGV0IHJlY2VudEZpbGUgPSByZWNlbnRGaWxlcy5maW5kKChmaWxlKSA9PiBmaWxlLmlkID09PSBmaWxlSWQpO1xyXG4gICAgICAgICAgICBpZiAoIWZpbGVBbHJlYWR5RXhpc3RzKSB7XHJcbiAgICAgICAgICAgICAgICByZW1vdGVGaWxlcy5wdXNoKHJlY2VudEZpbGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIFVwZGF0ZSBhbGwgcmVtb3RlIGZpbGVzIHdpdGggZGF0YSBmcm9tIHJlY2VudCBmaWxlc1xyXG4gICAgICAgIGlmIChyZWNlbnRGaWxlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVtb3RlRmlsZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciByZW1vdGVGaWxlID0gcmVtb3RlRmlsZXNbaV07XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHJlY2VudEZpbGVzLmxlbmd0aDsgeCsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlY2VudEZpbGUgPSByZWNlbnRGaWxlc1t4XTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBVcGRhdGUgZXhpc3RpbmcgcmVtb3RlIGZpbGVzXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlY2VudEZpbGUuaWQgPT09IHJlbW90ZUZpbGUuaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3RlRmlsZXNbaV0gPSByZWNlbnRGaWxlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyAvLyBJIHRoaW5rIHRoaXMgaXMgYSBtZXRob2Qgb2YgbWVyZ2luZyBmaWxlcywgbWF5YmUgcmVtb3ZpbmcgZHVwbGljYXRlcz9cclxuICAgICAgICAgICAgLy8gdmFyIGlkcyA9IG5ldyBTZXQocmVtb3RlRmlsZXMubWFwKChmaWxlKSA9PiBmaWxlLmlkKSk7XHJcbiAgICAgICAgICAgIC8vIHZhciBtZXJnZWQgPSBbXHJcbiAgICAgICAgICAgIC8vICAgLi4ucmVtb3RlRmlsZXMsXHJcbiAgICAgICAgICAgIC8vICAgLi4ucmVjZW50RmlsZXMuZmlsdGVyKChmaWxlKSA9PiAhaWRzLmhhcyhmaWxlLmlkKSksXHJcbiAgICAgICAgICAgIC8vIF07XHJcbiAgICAgICAgICAgIC8vIC8vIEV4Y2x1ZGUgY3VycmVudCBmaWxlIChiZWNhdXNlIHdlIHdhbnQgcmVtb3RlIGZpbGVzIHRvIHRoaXMgZmlsZSBvbmx5KVxyXG4gICAgICAgICAgICAvLyBtZXJnZWQgPSBtZXJnZWQuZmlsdGVyKChmaWxlKSA9PiB7XHJcbiAgICAgICAgICAgIC8vICAgcmV0dXJuICEoZmlsZS5pZCA9PT0gZ2V0UGx1Z2luRGF0YShmaWdtYS5yb290LCBcImZpbGVJZFwiKSk7XHJcbiAgICAgICAgICAgIC8vIH0pO1xyXG4gICAgICAgICAgICAvLyBFeGNsdWRlIGN1cnJlbnQgZmlsZSAoYmVjYXVzZSB3ZSB3YW50IHJlbW90ZSBmaWxlcyB0byB0aGlzIGZpbGUgb25seSlcclxuICAgICAgICAgICAgcmVtb3RlRmlsZXMgPSByZW1vdGVGaWxlcy5maWx0ZXIoKGZpbGUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAhKGZpbGUuaWQgPT09IGdldFBsdWdpbkRhdGEoZmlnbWEucm9vdCwgXCJmaWxlSWRcIikpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gfVxyXG4gICAgICAgIC8vIFRoZW4gSSBjaGVjayB0byBzZWUgaWYgdGhlIGZpbGUgbmFtZSBoYXMgY2hhbmdlZCBhbmQgbWFrZSBzdXJlIGl0J3MgdXAgdG8gZGF0ZVxyXG4gICAgICAgIC8vIEZvciBub3cgSSd2ZSBkZWNpZGVkIHRvIGluY2x1ZGUgdW5wdWJsaXNoZWQgY29tcG9uZW50cyBpbiByZW1vdGUgZmlsZXMsIHRvIGFjdCBhcyBhIHJlbWluZGVyIHRvIHBlb3BsZSB0byBwdWJsaXNoIHRoZW1cclxuICAgICAgICBpZiAocmVtb3RlRmlsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlbW90ZUZpbGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZmlsZSA9IHJlbW90ZUZpbGVzW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKGZpbGUuZGF0YVswXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpZ21hXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5pbXBvcnRDb21wb25lbnRCeUtleUFzeW5jKGZpbGUuZGF0YVswXS5jb21wb25lbnQua2V5KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoY29tcG9uZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZW1vdGVUZW1wbGF0ZSA9IGdldFBsdWdpbkRhdGEoY29tcG9uZW50LCBcInRlbXBsYXRlXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVQbHVnaW5EYXRhKGZpZ21hLnJvb3QsIFwicmVtb3RlRmlsZXNcIiwgKHJlbW90ZUZpbGVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdGVGaWxlcy5tYXAoKGZpbGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZS5pZCA9PT0gcmVtb3RlVGVtcGxhdGUuZmlsZS5pZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLm5hbWUgPSByZW1vdGVUZW1wbGF0ZS5maWxlLm5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVtb3RlRmlsZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGSVhNRTogRG8gSSBuZWVkIHRvIGRvIHNvbWV0aGluZyBoZXJlIGlmIGNvbXBvbmVudCBpcyBkZWxldGVkP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGSVhNRTogSXMgdGhpcyB0aGUgd3JvbmcgdGltZSB0byBjaGVjayBpZiBjb21wb25lbnQgaXMgcHVibGlzaGVkP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBmaWdtYS5ub3RpZnkoXCJQbGVhc2UgY2hlY2sgY29tcG9uZW50IGlzIHB1Ymxpc2hlZFwiKVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZW1vdGVGaWxlcztcclxuICAgIH0pO1xyXG59XHJcbmZ1bmN0aW9uIHJlbW92ZVJlbW90ZUZpbGUoZmlsZUlkKSB7XHJcbiAgICByZXR1cm4gdXBkYXRlUGx1Z2luRGF0YShmaWdtYS5yb290LCBcInJlbW90ZUZpbGVzXCIsIChyZW1vdGVGaWxlcykgPT4ge1xyXG4gICAgICAgIGxldCBmaWxlSW5kZXggPSByZW1vdGVGaWxlcy5maW5kSW5kZXgoKGZpbGUpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGZpbGUuaWQgPT09IGZpbGVJZDtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoZmlsZUluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgICAgICByZW1vdGVGaWxlcy5zcGxpY2UoZmlsZUluZGV4LCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlbW90ZUZpbGVzO1xyXG4gICAgfSk7XHJcbn1cblxuLyoqXHJcbiAqIEluY3JlbWVudHMgdGhlIG5hbWUgbnVtZXJpY2FsbHkgYnkgMS5cclxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgVGhlIG5hbWUgeW91IHdhbnQgdG8gaW5jcmVtZW50XHJcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IEFuIGFycmF5IG9mIG9iamVjdHMgdG8gc29ydCBhbmQgY29tcGFyZSBhZ2FpbnN0XHJcbiAqIEByZXR1cm5zIFRoZSBpbmNyZW1lbnRlZCBuYW1lXHJcbiAqL1xyXG5mdW5jdGlvbiBpbmNyZW1lbnROYW1lKG5hbWUsIGFycmF5KSB7XHJcbiAgICBsZXQgbmFtZVRvTWF0Y2ggPSBuYW1lO1xyXG4gICAgaWYgKGFycmF5ICYmIGFycmF5Lmxlbmd0aCA+IDEpIHtcclxuICAgICAgICBhcnJheS5zb3J0KChhLCBiKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChhLm5hbWUgPT09IGIubmFtZSlcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICByZXR1cm4gYS5uYW1lID4gYi5uYW1lID8gLTEgOiAxO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG5hbWVUb01hdGNoID0gYXJyYXlbMF0ubmFtZTtcclxuICAgIH1cclxuICAgIGxldCBtYXRjaGVzID0gbmFtZVRvTWF0Y2gubWF0Y2goL14oLipcXFMpKFxccyopKFxcZCspJC8pO1xyXG4gICAgLy8gQW5kIGluY3JlbWVudCBieSAxXHJcbiAgICAvLyBJZ25vcmVzIGlmIGFycmF5IGlzIGVtcHR5XHJcbiAgICBpZiAobWF0Y2hlcyAmJiAhKGFycmF5ICYmIGFycmF5Lmxlbmd0aCA9PT0gMCkpIHtcclxuICAgICAgICBuYW1lID0gYCR7bWF0Y2hlc1sxXX0ke21hdGNoZXNbMl19JHtwYXJzZUludChtYXRjaGVzWzNdLCAxMCkgKyAxfWA7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmFtZTtcclxufVxuXG4vKipcclxuICogRGlzcGxheXMgYSBQcm9tcHQgRGlhbG9nLCB0byBnZXQgYW4gaW5wdXQgZnJvbSB0aGUgdXNlci5cclxuICogQHBhcmFtIHtzdHJpbmd9IHRpdGxlIEhlYWRsaW5lIHRleHQgZm9yIHRoZSBwcm9tcCBkaWFsb2dcclxuICogQHBhcmFtIHtzdHJpbmd9IGRlc2NyaXB0aW9uIERlc2NyaXB0aW9uIHRleHQgZm9yIHRoZSBwcm9tcCBkaWFsb2dcclxuICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIFRoZSBkZWZhdWx0IHZhbHVlIGluc2lkZSB0aGUgcHJvbXB0XHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNwbGFjZWhvbGRlciBkaXNwbGF5IHRoZSB2YWx1ZSBhcyBhIHBsYWNlaG9sZGVyIHZhbHVlXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBwcm9tcHQodGl0bGUsIGRlc2NyaXB0aW9uLCB2YWx1ZSwgaXNwbGFjZWhvbGRlcikge1xyXG4gICAgbGV0IHQgPSBEYXRlLm5vdygpO1xyXG4gICAgbGV0IGlucHV0ID0gaXNwbGFjZWhvbGRlciA/IGBwbGFjZWhvbGRlcj1cIiR7dmFsdWV9XCJgIDogYHZhbHVlPVwiJHt2YWx1ZX1cImA7XHJcbiAgICBsZXQgZGlzYWJsZWQgPSBpc3BsYWNlaG9sZGVyID8gJ2Rpc2FibGVkJyA6ICcnO1xyXG4gICAgZmlnbWEuc2hvd1VJKGBcclxuXHJcbjxib2R5PiAgXHJcbiAgICA8aDI+JHt0aXRsZX08L2gyPlxyXG5cclxuICAgIDxwPiR7ZGVzY3JpcHRpb259PC9wPlxyXG4gICAgICAgIDxpbnB1dCBpZD1cInByb21wdFwiIHR5cGU9XCJ0ZXh0XCIgJHtpbnB1dH0gb25rZXl1cD1cInN1Y2Nlc3MoKVwiIFwiLz5cclxuICAgICAgICA8YnV0dG9uIGlkPVwiYnV0dG9uXCIgJHtkaXNhYmxlZH0gb25jbGljaz1cIm15RnVuY3Rpb24oKVwiPk9rPC9idXR0b24+XHJcbiAgICA8c2NyaXB0PlxyXG5cclxuXHJcbmNvbnN0IGlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcm9tcHRcIik7XHJcbmlucHV0LmZvY3VzKClcclxuXHJcblxyXG5pbnB1dC5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHJcbiAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XHJcblxyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ1dHRvblwiKS5jbGljaygpO1xyXG4gIH1cclxufSk7XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIHN1Y2Nlc3MoKSB7XHJcbiAgICAgICAgaWYoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcm9tcHRcIikudmFsdWU9PT1cIlwiKSB7IFxyXG4gICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnV0dG9uJykuZGlzYWJsZWQgPSB0cnVlOyBcclxuICAgICAgICAgICB9IGVsc2UgeyBcclxuICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J1dHRvbicpLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgfVxyXG4gICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBteUZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHBhcmVudC5wb3N0TWVzc2FnZSh7IHBsdWdpbk1lc3NhZ2U6IHtcInR5cGVcIjogJ3Byb21wdCR7dH0nLCAgIFwidmFsdWVcIjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Byb21wdCcpLnZhbHVlfSB9LCAnKicpXHJcbiAgICAgICAgfVxyXG5cclxuXHJcblxyXG4gICAgPC9zY3JpcHQ+XHJcbjwvYm9keT5cclxuPHN0eWxlPlxyXG5ib2R5IHtcclxuICAgIHBhZGRpbmc6IDIwcHg7XHJcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xyXG4gICAgbWFyZ2luOiAwXHJcbn1cclxuXHJcbmgyLFxyXG5wIHtcclxuICAgIGZvbnQtc2l6ZTogMTNweDtcclxuICAgIGNvbG9yOiAjMDAwO1xyXG4gICAgbWFyZ2luOiAwIDAgOHB4XHJcbn1cclxuXHJcbnAge1xyXG4gICAgZm9udC1zaXplOiAxMXB4O1xyXG4gICAgY29sb3I6ICMzMzNcclxufVxyXG5cclxuYnV0dG9uLFxyXG5pbnB1dCB7XHJcbiAgICBwYWRkaW5nOiA0cHg7XHJcbiAgICBmb250LXNpemU6IDExcHg7XHJcbiAgICBmb250LXdlaWdodDogNDAwXHJcbn1cclxuXHJcbmJvZHksXHJcbmJ1dHRvbiB7XHJcbiAgICBkaXNwbGF5OiBmbGV4O1xyXG4gICAgZm9udC1mYW1pbHk6ICdJbnRlcicsIHNhbnMtc2VyaWZcclxufVxyXG5cclxuYnV0dG9uIHtcclxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XHJcbiAgICBib3JkZXItcmFkaXVzOiA0cHg7XHJcbiAgICBjb2xvcjogI2ZmZjtcclxuICAgIGZsZXgtc2hyaW5rOiAwO1xyXG4gICAgZm9udC13ZWlnaHQ6IDUwMDtcclxuICAgIGhlaWdodDogMzJweDtcclxuICAgIHBhZGRpbmc6IDAgOHB4O1xyXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xyXG4gICAgb3V0bGluZTogMDtcclxuICAgIGJvcmRlcjogMnB4IHNvbGlkIHRyYW5zcGFyZW50O1xyXG4gICAgLXdlYmtpdC11c2VyLXNlbGVjdDogbm9uZTtcclxuICAgIC1tb3otdXNlci1zZWxlY3Q6IG5vbmU7XHJcbiAgICAtbXMtdXNlci1zZWxlY3Q6IG5vbmU7XHJcbiAgICB1c2VyLXNlbGVjdDogbm9uZTtcclxuICAgIHBvc2l0aW9uOiBmaXhlZDtcclxuICAgIGJvdHRvbTogMjBweDtcclxuICAgIHJpZ2h0OiAyMHB4O1xyXG4gICAgbWluLXdpZHRoOiA2NHB4O1xyXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XHJcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMThhMGZiXHJcbn1cclxuXHJcbmJ1dHRvbjpkaXNhYmxlZCB7XHJcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjYjNiM2IzXHJcbn1cclxuXHJcbmRpdiB7XHJcbiAgICBkaXNwbGF5OiBmbGV4O1xyXG4gICAgZmxleC1kaXJlY3Rpb246IHJvd1xyXG59XHJcbjwvc3R5bGU+XHJcbmAsIHtcclxuICAgICAgICB3aWR0aDogMzAwLFxyXG4gICAgICAgIGhlaWdodDogMTUwXHJcbiAgICB9KTtcclxuICAgIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICAgIGZpZ21hLnVpLm9ubWVzc2FnZSA9IChtZXNzYWdlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlLnR5cGUgPT0gXCJwcm9tcHRcIiArIHQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UudmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG4gICAgY29uc3QgcmV0dXJuRGF0YSA9IGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICBmaWdtYS51aS5vbm1lc3NhZ2UgPSAobWVzc2FnZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAobWVzc2FnZS50eXBlID09IFwicHJvbXB0XCIgKyB0KSB7XHJcbiAgICAgICAgICAgICAgICBmaWdtYS51aS5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShtZXNzYWdlLnZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgZmlnbWEub24oXCJjbG9zZVwiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJlamVjdChcInBsdWdpbiBjbG9zZWRcIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiByZXR1cm5EYXRhO1xyXG59XG5cbmV4cG9ydHMuYWRkUmVjZW50RmlsZUFzeW5jID0gYWRkUmVjZW50RmlsZUFzeW5jO1xuZXhwb3J0cy5jb252ZXJ0VG9Db21wb25lbnQgPSBjb252ZXJ0VG9Db21wb25lbnQ7XG5leHBvcnRzLmNvbnZlcnRUb0ZyYW1lID0gY29udmVydFRvRnJhbWU7XG5leHBvcnRzLmNvcHlQYXN0ZSA9IGNvcHlQYXN0ZTtcbmV4cG9ydHMuZGlzcGF0Y2hFdmVudCA9IGRpc3BhdGNoRXZlbnQ7XG5leHBvcnRzLmZsaXBYID0gZmxpcFg7XG5leHBvcnRzLmZsaXBZID0gZmxpcFk7XG5leHBvcnRzLmdlblVJRCA9IGdlblVJRDtcbmV4cG9ydHMuZ2V0Q2xpZW50U3RvcmFnZUFzeW5jID0gZ2V0Q2xpZW50U3RvcmFnZUFzeW5jO1xuZXhwb3J0cy5nZXREb2N1bWVudERhdGEgPSBnZXREb2N1bWVudERhdGE7XG5leHBvcnRzLmdldEluc3RhbmNlQ291bnRlcnBhcnQgPSBnZXRJbnN0YW5jZUNvdW50ZXJwYXJ0O1xuZXhwb3J0cy5nZXRJbnN0YW5jZUNvdW50ZXJwYXJ0VXNpbmdMb2NhdGlvbiA9IGdldEluc3RhbmNlQ291bnRlcnBhcnRVc2luZ0xvY2F0aW9uO1xuZXhwb3J0cy5nZXROb2RlRGVwdGggPSBnZXROb2RlRGVwdGg7XG5leHBvcnRzLmdldE5vZGVJbmRleCA9IGdldE5vZGVJbmRleDtcbmV4cG9ydHMuZ2V0Tm9kZUxvY2F0aW9uID0gZ2V0Tm9kZUxvY2F0aW9uO1xuZXhwb3J0cy5nZXROb25lR3JvdXBQYXJlbnQgPSBnZXROb25lR3JvdXBQYXJlbnQ7XG5leHBvcnRzLmdldE92ZXJyaWRlcyA9IGdldE92ZXJyaWRlcztcbmV4cG9ydHMuZ2V0UGFnZU5vZGUgPSBnZXRQYWdlTm9kZTtcbmV4cG9ydHMuZ2V0UGFyZW50SW5zdGFuY2UgPSBnZXRQYXJlbnRJbnN0YW5jZTtcbmV4cG9ydHMuZ2V0UGx1Z2luRGF0YSA9IGdldFBsdWdpbkRhdGE7XG5leHBvcnRzLmdldFJlY2VudEZpbGVzQXN5bmMgPSBnZXRSZWNlbnRGaWxlc0FzeW5jO1xuZXhwb3J0cy5nZXRSZW1vdGVGaWxlc0FzeW5jID0gZ2V0UmVtb3RlRmlsZXNBc3luYztcbmV4cG9ydHMuZ2V0VG9wSW5zdGFuY2UgPSBnZXRUb3BJbnN0YW5jZTtcbmV4cG9ydHMuaGFuZGxlRXZlbnQgPSBoYW5kbGVFdmVudDtcbmV4cG9ydHMuaGV4VG9QYWludHMgPSBoZXhUb1BhaW50cztcbmV4cG9ydHMuaGV4VG9SZ2IgPSBoZXhUb1JnYjtcbmV4cG9ydHMuaW5jcmVtZW50TmFtZSA9IGluY3JlbWVudE5hbWU7XG5leHBvcnRzLmlzSW5zaWRlSW5zdGFuY2UgPSBpc0luc2lkZUluc3RhbmNlO1xuZXhwb3J0cy5tYWtlQ29tcG9uZW50ID0gbWFrZUNvbXBvbmVudDtcbmV4cG9ydHMubm9kZVRvT2JqZWN0ID0gbm9kZVRvT2JqZWN0O1xuZXhwb3J0cy5wcm9tcHQgPSBwcm9tcHQ7XG5leHBvcnRzLnJlbW92ZUNoaWxkcmVuID0gcmVtb3ZlQ2hpbGRyZW47XG5leHBvcnRzLnJlbW92ZVJlbW90ZUZpbGUgPSByZW1vdmVSZW1vdGVGaWxlO1xuZXhwb3J0cy5yZXBsYWNlID0gcmVwbGFjZTtcbmV4cG9ydHMucmVzaXplID0gcmVzaXplO1xuZXhwb3J0cy5zZXRDbGllbnRTdG9yYWdlQXN5bmMgPSBzZXRDbGllbnRTdG9yYWdlQXN5bmM7XG5leHBvcnRzLnNldERvY3VtZW50RGF0YSA9IHNldERvY3VtZW50RGF0YTtcbmV4cG9ydHMuc2V0UGx1Z2luRGF0YSA9IHNldFBsdWdpbkRhdGE7XG5leHBvcnRzLnVuZ3JvdXAgPSB1bmdyb3VwO1xuZXhwb3J0cy51cGRhdGVDbGllbnRTdG9yYWdlQXN5bmMgPSB1cGRhdGVDbGllbnRTdG9yYWdlQXN5bmM7XG5leHBvcnRzLnVwZGF0ZURvY3VtZW50RGF0YSA9IHVwZGF0ZURvY3VtZW50RGF0YTtcbmV4cG9ydHMudXBkYXRlUGx1Z2luRGF0YSA9IHVwZGF0ZVBsdWdpbkRhdGE7XG4iLCJpbXBvcnQge1xuXHRub2RlUmVtb3ZlZEJ5VXNlcixcblx0Y2VudGVySW5WaWV3cG9ydCxcblx0c29ydE5vZGVzQnlQb3NpdGlvbixcbn0gZnJvbSBcIi4vaGVscGVyc1wiO1xuaW1wb3J0IHsgY29weVBhc3RlLCBnZXRQYWdlTm9kZSB9IGZyb20gXCJAZmlnbml0ZS9oZWxwZXJzXCI7XG4vLyBUT0RPOiBDaGVjayBhbmQgdXBkYXRlIGxheWVyIHN0eWxlIHByZXZpZXdzIHdoZW4gVUkgb3BlbnNcbi8vIFRPRE86IFdoZW4gZWRpdGluZyBhIGxheWVyIHN0eWxlLCBjaGVjayB0aGF0IHRoZSBub2RlIGlzIGEgY29tcG9uZW50IGFuZCBpZiBpdCdzIGJlZW4gZGVsZXRlZCBieSB1c2VyXG5cbmNvbnN0IHN0eWxlUHJvcHMgPSBbXG5cdC8vICdjb25zdHJhaW5Qcm9wb3J0aW9ucycsXG5cdC8vICdsYXlvdXRBbGlnbicsXG5cdC8vICdsYXlvdXRHcm93Jyxcblx0XCJvcGFjaXR5XCIsXG5cdFwiYmxlbmRNb2RlXCIsXG5cdFwiZWZmZWN0c1wiLFxuXHRcImVmZmVjdFN0eWxlSWRcIixcblx0Ly8gJ2V4cGFuZGVkJyxcblx0XCJiYWNrZ3JvdW5kc1wiLFxuXHRcImJhY2tncm91bmRTdHlsZUlkXCIsXG5cdFwiZmlsbHNcIixcblx0XCJzdHJva2VzXCIsXG5cdFwic3Ryb2tlV2VpZ2h0XCIsXG5cdFwic3Ryb2tlTWl0ZXJMaW1pdFwiLFxuXHRcInN0cm9rZUFsaWduXCIsXG5cdFwic3Ryb2tlQ2FwXCIsXG5cdFwic3Ryb2tlSm9pblwiLFxuXHRcImRhc2hQYXR0ZXJuXCIsXG5cdFwiZmlsbFN0eWxlSWRcIixcblx0XCJzdHJva2VTdHlsZUlkXCIsXG5cdFwiY29ybmVyUmFkaXVzXCIsXG5cdFwiY29ybmVyU21vb3RoaW5nXCIsXG5cdFwidG9wTGVmdFJhZGl1c1wiLFxuXHRcInRvcFJpZ2h0UmFkaXVzXCIsXG5cdFwiYm90dG9tTGVmdFJhZGl1c1wiLFxuXHRcImJvdHRvbVJpZ2h0UmFkaXVzXCIsXG5cdC8vICdsYXlvdXRNb2RlJyxcblx0Ly8gJ3ByaW1hcnlBeGlzU2l6aW5nTW9kZScsXG5cdC8vICdjb3VudGVyQXhpc1NpemluZ01vZGUnLFxuXHQvLyAncHJpbWFyeUF4aXNBbGlnbkl0ZW1zJyxcblx0Ly8gJ2NvdW50ZXJBeGlzQWxpZ25JdGVtcycsXG5cdFwicGFkZGluZ0xlZnRcIixcblx0XCJwYWRkaW5nUmlnaHRcIixcblx0XCJwYWRkaW5nVG9wXCIsXG5cdFwicGFkZGluZ0JvdHRvbVwiLFxuXHRcIml0ZW1TcGFjaW5nXCIsXG5cdFwibGF5b3V0R3JpZHNcIixcblx0XCJncmlkU3R5bGVJZFwiLFxuXHQvLyAnY2xpcHNDb250ZW50Jyxcblx0Ly8gJ2d1aWRlcydcbl07XG5cbmZ1bmN0aW9uIGNvcHlQYXN0ZVN0eWxlKHNvdXJjZSwgdGFyZ2V0Pykge1xuXHRpZiAodGFyZ2V0KSB7XG5cdFx0cmV0dXJuIGNvcHlQYXN0ZShzb3VyY2UsIHRhcmdldCwge1xuXHRcdFx0aW5jbHVkZTogc3R5bGVQcm9wcyxcblx0XHRcdGV4Y2x1ZGU6IFtcblx0XHRcdFx0XCJhdXRvUmVuYW1lXCIsXG5cdFx0XHRcdFwiY2hhcmFjdGVyc1wiLFxuXHRcdFx0XHRcImZvbnROYW1lXCIsXG5cdFx0XHRcdFwiZm9udFNpemVcIixcblx0XHRcdFx0XCJyb3RhdGlvblwiLFxuXHRcdFx0XHRcInByaW1hcnlBeGlzU2l6aW5nTW9kZVwiLFxuXHRcdFx0XHRcImNvdW50ZXJBeGlzU2l6aW5nTW9kZVwiLFxuXHRcdFx0XHRcInByaW1hcnlBeGlzQWxpZ25JdGVtc1wiLFxuXHRcdFx0XHRcImNvdW50ZXJBeGlzQWxpZ25JdGVtc1wiLFxuXHRcdFx0XHRcImNvbnN0cmFpblByb3BvcnRpb25zXCIsXG5cdFx0XHRcdFwibGF5b3V0QWxpZ25cIixcblx0XHRcdFx0XCJsYXlvdXRHcm93XCIsXG5cdFx0XHRcdFwibGF5b3V0TW9kZVwiLFxuXHRcdFx0XSxcblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gY29weVBhc3RlKHNvdXJjZSwge30pO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldEluc3RhbmNlcyhzdHlsZUlkPykge1xuXHRyZXR1cm4gZmlnbWEucm9vdC5maW5kQWxsKFxuXHRcdChub2RlKSA9PiBub2RlLmdldFBsdWdpbkRhdGEoXCJzdHlsZUlkXCIpID09PSBzdHlsZUlkLFxuXHQpO1xufVxuXG5mdW5jdGlvbiBhZGRJbnN0YW5jZShzdHlsZUlkLCBub2RlSWQpIHtcblx0dmFyIGluc3RhbmNlcyA9IGdldEluc3RhbmNlcyhzdHlsZUlkKTtcblxuXHRpbnN0YW5jZXMucHVzaChub2RlSWQpO1xuXG5cdGZpZ21hLnJvb3Quc2V0UGx1Z2luRGF0YShcImxheWVyU3R5bGVcIiArIHN0eWxlSWQsIEpTT04uc3RyaW5naWZ5KGluc3RhbmNlcykpO1xufVxuXG4vLyBUT0RPOiBOZWVkIHRvIGFkZCBhIGxpbWl0LCBpbmNhc2UgdXNlciB0cmllcyB0byBhZGQgdG9vIG1hbnkgbGF5ZXIgc3R5bGVzIGF0IG9uY2VcbmFzeW5jIGZ1bmN0aW9uIGFkZExheWVyU3R5bGUobm9kZSkge1xuXHR2YXIgbGF5ZXJTdHlsZXM6IGFueSA9IGdldExheWVyU3R5bGVzKCk7XG5cblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBsYXllclN0eWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBsYXllclN0eWxlID0gbGF5ZXJTdHlsZXNbaV07XG5cblx0XHRpZiAobGF5ZXJTdHlsZS5pZCA9PT0gbm9kZS5pZCkge1xuXHRcdFx0Y29uc29sZS5sb2coXCJMYXllciBzdHlsZSBhbHJlYWR5IGV4aXN0c1wiKTtcblx0XHRcdGZpZ21hLm5vdGlmeShcIkxheWVyIHN0eWxlIGFscmVhZHkgZXhpc3RzXCIpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0fVxuXG5cdHZhciBuZXdMYXllclN0eWxlID0ge1xuXHRcdGlkOiBub2RlLmlkLFxuXHRcdG5vZGU6IGNvcHlQYXN0ZVN0eWxlKG5vZGUpLFxuXHRcdG5hbWU6IG5vZGUubmFtZSxcblx0fTtcblxuXHRsYXllclN0eWxlcy5wdXNoKG5ld0xheWVyU3R5bGUpO1xuXG5cdGZpZ21hLnJvb3Quc2V0UGx1Z2luRGF0YShcInN0eWxlc1wiLCBKU09OLnN0cmluZ2lmeShsYXllclN0eWxlcykpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVMYXllclN0eWxlKGlkLCBuYW1lPywgcHJvcGVydGllcz8sIG5ld0lkPykge1xuXHR2YXIgc3R5bGVzID0gZ2V0TGF5ZXJTdHlsZXMoKTtcblxuXHRzdHlsZXMubWFwKChvYmopID0+IHtcblx0XHRpZiAob2JqLmlkID09IGlkKSB7XG5cdFx0XHRpZiAobmFtZSkge1xuXHRcdFx0XHRvYmoubmFtZSA9IG5hbWU7XG5cdFx0XHR9XG5cdFx0XHRpZiAocHJvcGVydGllcykge1xuXHRcdFx0XHRvYmoubm9kZSA9IHByb3BlcnRpZXM7XG5cdFx0XHR9XG5cdFx0XHRpZiAobmV3SWQpIHtcblx0XHRcdFx0b2JqLmlkID0gbmV3SWQ7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblxuXHRmaWdtYS5yb290LnNldFBsdWdpbkRhdGEoXCJzdHlsZXNcIiwgSlNPTi5zdHJpbmdpZnkoc3R5bGVzKSk7XG59XG5cbmZ1bmN0aW9uIGdldExheWVyU3R5bGVzKGlkPykge1xuXHR2YXIgc3R5bGVzOiBhbnkgPSBmaWdtYS5yb290LmdldFBsdWdpbkRhdGEoXCJzdHlsZXNcIik7XG5cblx0aWYgKHN0eWxlcyAhPT0gXCJcIikge1xuXHRcdHN0eWxlcyA9IEpTT04ucGFyc2Uoc3R5bGVzKTtcblx0fSBlbHNlIHtcblx0XHRzdHlsZXMgPSBbXTtcblx0fVxuXG5cdGlmIChpZCkge1xuXHRcdHZhciBuZXdTdHlsZXMgPSBzdHlsZXMuZmlsdGVyKGZ1bmN0aW9uIChzdHlsZSkge1xuXHRcdFx0cmV0dXJuIHN0eWxlLmlkID09PSBpZDtcblx0XHR9KTtcblxuXHRcdHN0eWxlcyA9IG5ld1N0eWxlc1swXTtcblx0fVxuXG5cdHJldHVybiBzdHlsZXM7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUluc3RhbmNlcyhzZWxlY3Rpb24sIGlkPykge1xuXHQvLyBGaW5kIG5vZGVzIHRoYXQgc2hvdWxkIGJlIHVwZGF0ZWQgd2l0aCBuZXcgcHJvcGVydGllc1xuXHR2YXIgbm9kZXM7XG5cblx0aWYgKHNlbGVjdGlvbikge1xuXHRcdG5vZGVzID0gc2VsZWN0aW9uO1xuXHR9XG5cblx0aWYgKGlkKSB7XG5cdFx0bm9kZXMgPSBbXTtcblx0XHR2YXIgcGFnZXMgPSBmaWdtYS5yb290LmNoaWxkcmVuO1xuXHRcdHZhciBsZW5ndGggPSBwYWdlcy5sZW5ndGg7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuXHRcdFx0cGFnZXNbaV0uZmluZEFsbCgobm9kZSkgPT4ge1xuXHRcdFx0XHRpZiAobm9kZS5nZXRQbHVnaW5EYXRhKFwic3R5bGVJZFwiKSA9PT0gaWQpIHtcblx0XHRcdFx0XHRub2Rlcy5wdXNoKG5vZGUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHQvLy8vIFRoaXMgbWV0aG9kIGlzIGEgbG90IHNsb3dlciEhIVxuXHRcdC8vIHZhciBpbnN0YW5jZXMgPSBnZXRJbnN0YW5jZXMobm9kZUJlaW5nRWRpdGVkLmdldFBsdWdpbkRhdGEoXCJzdHlsZUlkXCIpKVxuXG5cdFx0Ly8gZm9yICh2YXIgaSA9IDA7IGkgPCBpbnN0YW5jZXMubGVuZ3RoOyBpKyspIHtcblx0XHQvLyBcdHZhciBpbnN0YW5jZUlkID0gaW5zdGFuY2VzW2ldXG5cdFx0Ly8gXHRub2Rlcy5wdXNoKGZpZ21hLmdldE5vZGVCeUlkKGluc3RhbmNlSWQpKVxuXHRcdC8vIH1cblx0fVxuXG5cdC8vIEZvciBlYWNoIG5vZGVcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBub2RlID0gbm9kZXNbaV07XG5cdFx0dmFyIHN0eWxlSWQgPSBub2RlLmdldFBsdWdpbkRhdGEoXCJzdHlsZUlkXCIpO1xuXG5cdFx0Ly8gTG9vayBmb3Igbm9kZSB3aXRoIG1hdGNoaW5nIHN0eWxlSURcblx0XHR2YXIgc291cmNlID0gZmlnbWEuZ2V0Tm9kZUJ5SWQoc3R5bGVJZCk7XG5cdFx0dmFyIGxheWVyU3R5bGU7XG5cblx0XHRpZiAoc291cmNlKSB7XG5cdFx0XHRsYXllclN0eWxlID0gc291cmNlO1xuXHRcdFx0dXBkYXRlTGF5ZXJTdHlsZShzdHlsZUlkLCBudWxsLCBjb3B5UGFzdGVTdHlsZShsYXllclN0eWxlKSk7XG5cdFx0XHRjb3B5UGFzdGVTdHlsZShsYXllclN0eWxlLCBub2RlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bGF5ZXJTdHlsZSA9IGdldExheWVyU3R5bGVzKHN0eWxlSWQpLm5vZGU7XG5cdFx0XHRjb3B5UGFzdGVTdHlsZShsYXllclN0eWxlLCBub2RlKTtcblx0XHRcdGNvbnNvbGUubG9nKFwiT3JpZ2luYWwgbm9kZSBjYW4ndCBiZSBmb3VuZFwiKTtcblx0XHR9XG5cdH1cblxuXHQvLyBmaWdtYS5jbG9zZVBsdWdpbigpXG59XG5cbmZ1bmN0aW9uIGNsZWFyTGF5ZXJTdHlsZSgpIHtcblx0ZmlnbWEucm9vdC5zZXRQbHVnaW5EYXRhKFwic3R5bGVzXCIsIFwiXCIpO1xuXHRjb25zb2xlLmxvZyhcIlN0eWxlcyBjbGVhcmVkXCIpO1xuXHRmaWdtYS5jbG9zZVBsdWdpbigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVTdHlsZXMoc2VsZWN0aW9uKSB7XG5cdGlmIChzZWxlY3Rpb24ubGVuZ3RoID4gMCkge1xuXHRcdGlmIChzZWxlY3Rpb24ubGVuZ3RoIDw9IDIwKSB7XG5cdFx0XHRzZWxlY3Rpb24gPSBzb3J0Tm9kZXNCeVBvc2l0aW9uKHNlbGVjdGlvbik7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNlbGVjdGlvbi5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgbm9kZSA9IHNlbGVjdGlvbltpXTtcblx0XHRcdFx0bm9kZS5zZXRQbHVnaW5EYXRhKFwic3R5bGVJZFwiLCBub2RlLmlkKTtcblx0XHRcdFx0Ly8gdmFyIHRhcmdldCA9IHBhc3RlUHJvcGVydGllcyhmaWdtYS5jcmVhdGVGcmFtZSgpLCBzdHlsZXMpXG5cdFx0XHRcdC8vIG5vZGUuc2V0UmVsYXVuY2hEYXRhKHsgdXBkYXRlU3R5bGVzOiAnUmVmcmVzaCBsYXllcnMgY29ubmVjdGVkIHRvIHRoaXMgc3R5bGUnIH0pO1xuXHRcdFx0XHQvLyBmaWdtYS52aWV3cG9ydC5zY3JvbGxBbmRab29tSW50b1ZpZXcoW3RhcmdldF0pO1xuXHRcdFx0XHQvLyBjb25zb2xlLmxvZyhub2RlKVxuXHRcdFx0XHRhZGRMYXllclN0eWxlKG5vZGUpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRmaWdtYS5ub3RpZnkoXCJMaW1pdGVkIHRvIDIwIGxheWVyIHN0eWxlcyBhdCBhIHRpbWVcIik7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdGZpZ21hLm5vdGlmeShcIk5vIGxheWVycyBzZWxlY3RlZFwiKTtcblx0fVxufVxuXG5mdW5jdGlvbiBhcHBseUxheWVyU3R5bGUoc2VsZWN0aW9uLCBzdHlsZUlkKSB7XG5cdC8vIFRPRE86IElmIG5vZGUgYWxyZWFkeSBoYXMgc3R5bGVJZCBhbmQgaXQgbWF0Y2hlcyBpdCdzIG5vZGUuaWQgdGhpcyBtZWFucyBpdCBpcyB0aGUgbWFzdGVyIG5vZGUgZm9yIGFub3RoZXIgc3R5bGUuIE5vdCBzdXJlIGhvdyB0byBmaXggdGhpcywgYXMgb3RoZXIgc3R5bGUgd2lsbCBsb29rIHRvIHRoaXMgbm9kZSBmb3IgaXQuIFBvc3NpYmxlIGZpeCBpcyB0byBjaGFuZ2Ugc3R5bGUgSUQgb2Ygbm9kZS5cblx0dmFyIGxheWVyU3R5bGU7XG5cdGxheWVyU3R5bGUgPSBnZXRMYXllclN0eWxlcyhzdHlsZUlkKS5ub2RlO1xuXHR2YXIgc291cmNlID0gZmlnbWEuZ2V0Tm9kZUJ5SWQoc3R5bGVJZCk7XG5cdGlmIChzZWxlY3Rpb24ubGVuZ3RoIDw9IDEwMCkge1xuXHRcdGlmIChzZWxlY3Rpb24ubGVuZ3RoID4gMCkge1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzZWxlY3Rpb24ubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIG5vZGUgPSBzZWxlY3Rpb25baV07XG5cdFx0XHRcdG5vZGUuc2V0UGx1Z2luRGF0YShcInN0eWxlSWRcIiwgc3R5bGVJZCk7XG5cdFx0XHRcdG5vZGUuc2V0UmVsYXVuY2hEYXRhKHtcblx0XHRcdFx0XHRkZXRhY2hMYXllclN0eWxlOiBcIlJlbW92ZXMgYXNzb2NpYXRpb24gd2l0aCBsYXllciBzdHlsZVwiLFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQvLyB2YXIgc3R5bGVJZCA9IG5vZGUuZ2V0UGx1Z2luRGF0YShcInN0eWxlSWRcIilcblxuXHRcdFx0XHQvLyBMb29rIGZvciBub2RlIHdpdGggbWF0Y2hpbmcgc3R5bGVJRFxuXG5cdFx0XHRcdGlmIChzb3VyY2UpIHtcblx0XHRcdFx0XHRsYXllclN0eWxlID0gc291cmNlO1xuXG5cdFx0XHRcdFx0Y29weVBhc3RlU3R5bGUobGF5ZXJTdHlsZSwgbm9kZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29weVBhc3RlU3R5bGUobGF5ZXJTdHlsZSwgbm9kZSk7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCJPcmlnaW5hbCBub2RlIGNhbid0IGJlIGZvdW5kXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRmaWdtYS5ub3RpZnkoXCJMYXllciBzdHlsZSBhcHBsaWVkXCIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRmaWdtYS5ub3RpZnkoXCJQbGVhc2Ugc2VsZWN0IGEgbGF5ZXJcIik7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdGZpZ21hLm5vdGlmeShcIkxpbWl0ZWQgdG8gMTAwIGxheWVycyBhdCBhIHRpbWVcIik7XG5cdH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlTGF5ZXJTdHlsZShzdHlsZUlkKSB7XG5cdHZhciBzdHlsZXMgPSBnZXRMYXllclN0eWxlcygpO1xuXG5cdC8vIFJlbW92ZSBsYXllciBzdHlsZSB3aXRoIG1hdGNoaW5nIG5vZGVcblx0c3R5bGVzLnNwbGljZShcblx0XHRzdHlsZXMuZmluZEluZGV4KChub2RlKSA9PiB7XG5cdFx0XHRyZXR1cm4gbm9kZS5pZCA9PT0gc3R5bGVJZDtcblx0XHR9KSxcblx0XHQxLFxuXHQpO1xuXG5cdC8vIFNldCBsYXllciBzdHlsZXMgYWdhaW5cblx0ZmlnbWEucm9vdC5zZXRQbHVnaW5EYXRhKFwic3R5bGVzXCIsIEpTT04uc3RyaW5naWZ5KHN0eWxlcykpO1xuXG5cdC8vIFJlbW92ZSBwbHVnaW4gZGF0YSBmcm9tIGFsbCBub2RlcyB3aXRoIG1hdGNoaW5nIHN0eWxlIGlkXG5cdC8vIHZhciBwYWdlcyA9IGZpZ21hLnJvb3QuY2hpbGRyZW5cblx0Ly8gdmFyIGxlbmd0aCA9IHBhZ2VzLmxlbmd0aDtcblx0Ly8gZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuXHQvLyBcdHBhZ2VzW2ldLmZpbmRBbGwobm9kZSA9PiB7XG5cdC8vIFx0XHRpZiAobm9kZS5nZXRQbHVnaW5EYXRhKFwic3R5bGVJZFwiKSA9PT0gc3R5bGVJZCkge1xuXHQvLyBcdFx0XHRub2RlLnNldFBsdWdpbkRhdGEoXCJzdHlsZUlkXCIsIFwiXCIpXG5cdC8vIFx0XHR9XG5cdC8vIFx0fSlcblx0Ly8gfVxuXG5cdGZpZ21hLnJvb3QuZmluZEFsbCgobm9kZSkgPT4ge1xuXHRcdGlmIChub2RlLmdldFBsdWdpbkRhdGEoXCJzdHlsZUlkXCIpID09PSBzdHlsZUlkKSB7XG5cdFx0XHRub2RlLnNldFBsdWdpbkRhdGEoXCJzdHlsZUlkXCIsIFwiXCIpO1xuXHRcdH1cblx0fSk7XG5cblx0Ly8gVE9ETzogUmVtb3ZlIHJlbGF1bmNoIGRhdGFcbn1cblxuZnVuY3Rpb24gZGV0YWNoTGF5ZXJTdHlsZShub2RlKSB7XG5cdG5vZGUuc2V0UGx1Z2luRGF0YShcInN0eWxlSWRcIiwgXCJcIik7XG5cdG5vZGUuc2V0UmVsYXVuY2hEYXRhKHt9KTtcbn1cblxuZnVuY3Rpb24gcG9zdE1lc3NhZ2UoKSB7XG5cdHZhciBzdHlsZXMgPSBnZXRMYXllclN0eWxlcygpO1xuXHRmaWdtYS51aS5wb3N0TWVzc2FnZShzdHlsZXMpO1xufVxuXG5mdW5jdGlvbiBkZWJvdW5jZShmdW5jLCB3YWl0LCBpbW1lZGlhdGU/KSB7XG5cdHZhciB0aW1lb3V0O1xuXHRyZXR1cm4gZnVuY3Rpb24gKCkge1xuXHRcdHZhciBjb250ZXh0ID0gdGhpcyxcblx0XHRcdGFyZ3MgPSBhcmd1bWVudHM7XG5cdFx0dmFyIGxhdGVyID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0dGltZW91dCA9IG51bGw7XG5cdFx0XHRpZiAoIWltbWVkaWF0ZSkgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcblx0XHR9O1xuXHRcdHZhciBjYWxsTm93ID0gaW1tZWRpYXRlICYmICF0aW1lb3V0O1xuXHRcdGNsZWFyVGltZW91dCh0aW1lb3V0KTtcblx0XHR0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCk7XG5cdFx0aWYgKGNhbGxOb3cpIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG5cdH07XG59XG5cbi8vIFRoaXMgdXBkYXRlcyBwcmV2aWV3IGluc2lkZSBsYXllciBzdHlsZXMgbGlzdFxuLy8gVE9ETzogTmVlZCB0byBiZSBjYXJlZnVsIGlmIHNvbWV0aGluZyBoYXBwZW5zIHRvIG5vZGUgd2hpbGUgaXQncyBiZWluZyB3YXRjaGVkLCBmb3IgZXhhbXBsZSBpZiBpdCdzIGRlbGV0ZWRcblxuLy8gVGhlIG5vZGUgYmVpbmcgZWRpdGVkXG52YXIgbm9kZUJlaW5nRWRpdGVkID0gbnVsbDtcblxuZnVuY3Rpb24gY2hlY2tOb2RlQmVpbmdFZGl0ZWQoc2VsZWN0aW9uKSB7XG5cdGlmIChzZWxlY3Rpb24gJiYgc2VsZWN0aW9uLmxlbmd0aCA9PT0gMSkge1xuXHRcdHZhciBub2RlID0gc2VsZWN0aW9uWzBdO1xuXHRcdGlmIChub2RlLmlkID09PSBub2RlLmdldFBsdWdpbkRhdGEoXCJzdHlsZUlkXCIpKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhcIlNlbGVjdGlvbiBpcyBtYWluIGxheWVyIHN0eWxlXCIpO1xuXHRcdFx0bm9kZUJlaW5nRWRpdGVkID0gbm9kZTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlUHJldmlldyhub2RlQmVpbmdFZGl0ZWQpIHtcblx0aWYgKG5vZGVCZWluZ0VkaXRlZCkge1xuXHRcdHZhciBsYXllclN0eWxlSWQgPSBub2RlQmVpbmdFZGl0ZWQuZ2V0UGx1Z2luRGF0YShcInN0eWxlSWRcIik7XG5cdFx0dmFyIHByb3BlcnRpZXMgPSBjb3B5UGFzdGVTdHlsZShub2RlQmVpbmdFZGl0ZWQpO1xuXHRcdHVwZGF0ZUxheWVyU3R5bGUobGF5ZXJTdHlsZUlkLCBudWxsLCBwcm9wZXJ0aWVzKTtcblx0XHRwb3N0TWVzc2FnZSgpO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uICgpIHtcblx0ZmlnbWEub24oXCJzZWxlY3Rpb25jaGFuZ2VcIiwgKCkgPT4ge1xuXHRcdGNoZWNrTm9kZUJlaW5nRWRpdGVkKGZpZ21hLmN1cnJlbnRQYWdlLnNlbGVjdGlvbik7XG5cdFx0Y29uc29sZS5sb2coXCJTZWxlY3Rpb24gY2hhbmdlZFwiKTtcblxuXHRcdGlmIChub2RlQmVpbmdFZGl0ZWQpIHtcblx0XHRcdHNldEludGVydmFsKCgpID0+IHtcblx0XHRcdFx0dXBkYXRlUHJldmlldyhub2RlQmVpbmdFZGl0ZWQpO1xuXHRcdFx0fSwgNjAwKTtcblx0XHR9XG5cdFx0Ly8gSWYgdXNlciB1bnNlbGVjdHMgdGhlbiBjaGFuZ2Ugbm9kZSBiZWluZyBlZGl0ZWQgdG8gbnVsbFxuXHRcdGlmIChmaWdtYS5jdXJyZW50UGFnZS5zZWxlY3Rpb24ubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRub2RlQmVpbmdFZGl0ZWQgPSBudWxsO1xuXHRcdH1cblx0fSk7XG5cblx0aWYgKGZpZ21hLmNvbW1hbmQgPT09IFwic2hvd1N0eWxlc1wiKSB7XG5cdFx0Ly8gVGhpcyBzaG93cyB0aGUgSFRNTCBwYWdlIGluIFwidWkuaHRtbFwiLlxuXHRcdGZpZ21hLnNob3dVSShfX2h0bWxfXywgeyB3aWR0aDogMjQwLCBoZWlnaHQ6IDM2MCwgdGhlbWVDb2xvcnM6IHRydWUgfSk7XG5cblx0XHRwb3N0TWVzc2FnZSgpO1xuXG5cdFx0Ly8gQ2FsbHMgdG8gXCJwYXJlbnQucG9zdE1lc3NhZ2VcIiBmcm9tIHdpdGhpbiB0aGUgSFRNTCBwYWdlIHdpbGwgdHJpZ2dlciB0aGlzXG5cdFx0Ly8gY2FsbGJhY2suIFRoZSBjYWxsYmFjayB3aWxsIGJlIHBhc3NlZCB0aGUgXCJwbHVnaW5NZXNzYWdlXCIgcHJvcGVydHkgb2YgdGhlXG5cdFx0Ly8gcG9zdGVkIG1lc3NhZ2UuXG5cdFx0ZmlnbWEudWkub25tZXNzYWdlID0gKG1zZykgPT4ge1xuXHRcdFx0aWYgKG1zZy50eXBlID09PSBcImFkZC1zdHlsZVwiKSB7XG5cdFx0XHRcdGNyZWF0ZVN0eWxlcyhmaWdtYS5jdXJyZW50UGFnZS5zZWxlY3Rpb24pO1xuXHRcdFx0XHRwb3N0TWVzc2FnZSgpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAobXNnLnR5cGUgPT09IFwicmVuYW1lLXN0eWxlXCIpIHtcblx0XHRcdFx0dXBkYXRlTGF5ZXJTdHlsZShtc2cuaWQsIG1zZy5uYW1lKTtcblx0XHRcdFx0cG9zdE1lc3NhZ2UoKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG1zZy50eXBlID09PSBcInVwZGF0ZS1pbnN0YW5jZXNcIikge1xuXHRcdFx0XHR1cGRhdGVJbnN0YW5jZXMoZmlnbWEuY3VycmVudFBhZ2Uuc2VsZWN0aW9uLCBtc2cuaWQpO1xuXHRcdFx0XHRwb3N0TWVzc2FnZSgpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAobXNnLnR5cGUgPT09IFwidXBkYXRlLXN0eWxlXCIpIHtcblx0XHRcdFx0dmFyIG5vZGUgPSBmaWdtYS5jdXJyZW50UGFnZS5zZWxlY3Rpb25bMF07XG5cdFx0XHRcdHZhciBwcm9wZXJ0aWVzID0gY29weVBhc3RlU3R5bGUobm9kZSk7XG5cdFx0XHRcdHVwZGF0ZUxheWVyU3R5bGUobXNnLmlkLCBudWxsLCBwcm9wZXJ0aWVzLCBub2RlLmlkKTtcblx0XHRcdFx0ZmlnbWEuY3VycmVudFBhZ2Uuc2VsZWN0aW9uWzBdLnNldFBsdWdpbkRhdGEoXG5cdFx0XHRcdFx0XCJzdHlsZUlkXCIsXG5cdFx0XHRcdFx0bm9kZS5pZCxcblx0XHRcdFx0KTtcblx0XHRcdFx0cG9zdE1lc3NhZ2UoKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG1zZy50eXBlID09PSBcImVkaXQtbGF5ZXItc3R5bGVcIikge1xuXHRcdFx0XHR2YXIgbm9kZSA9IGZpZ21hLmdldE5vZGVCeUlkKG1zZy5pZCk7XG5cdFx0XHRcdGlmICghbm9kZVJlbW92ZWRCeVVzZXIobm9kZSkpIHtcblx0XHRcdFx0XHRmaWdtYS52aWV3cG9ydC5zY3JvbGxBbmRab29tSW50b1ZpZXcoW25vZGVdKTtcblx0XHRcdFx0XHRmaWdtYS52aWV3cG9ydC56b29tID0gMC4yNTtcblx0XHRcdFx0XHRmaWdtYS5jdXJyZW50UGFnZSA9IGdldFBhZ2VOb2RlKG5vZGUpO1xuXHRcdFx0XHRcdGZpZ21hLmN1cnJlbnRQYWdlLnNlbGVjdGlvbiA9IFtub2RlXTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBJZiBvcmdpbmFsIG5vZGUgY2FuJ3QgYmUgZm91bmQgYW55bW9yZVxuXHRcdFx0XHRcdG5vZGUgPSBmaWdtYS5jcmVhdGVGcmFtZSgpO1xuXHRcdFx0XHRcdHZhciBuZXdTdHlsZUlkID0gbm9kZS5pZDtcblx0XHRcdFx0XHR2YXIgcHJvcGVydGllcyA9IGdldExheWVyU3R5bGVzKG1zZy5pZCk7XG5cblx0XHRcdFx0XHRjb3B5UGFzdGVTdHlsZShwcm9wZXJ0aWVzLm5vZGUsIG5vZGUpO1xuXHRcdFx0XHRcdGNlbnRlckluVmlld3BvcnQobm9kZSk7XG5cdFx0XHRcdFx0bm9kZS5uYW1lID0gYCR7cHJvcGVydGllcy5uYW1lfWA7XG5cdFx0XHRcdFx0ZmlnbWEudmlld3BvcnQuc2Nyb2xsQW5kWm9vbUludG9WaWV3KFtub2RlXSk7XG5cdFx0XHRcdFx0ZmlnbWEudmlld3BvcnQuem9vbSA9IDAuMjU7XG5cdFx0XHRcdFx0Ly8gZmlnbWEudmlld3BvcnQuc2Nyb2xsQW5kWm9vbUludG9WaWV3KFtub2RlXSlcblxuXHRcdFx0XHRcdC8vIFNldCBhcyB0aGUgbmV3IG1hc3RlciBsYXllciBzdHlsZVxuXHRcdFx0XHRcdG5vZGUuc2V0UGx1Z2luRGF0YShcInN0eWxlSWRcIiwgbm9kZS5pZCk7XG5cblx0XHRcdFx0XHR1cGRhdGVMYXllclN0eWxlKG1zZy5pZCwgbnVsbCwgbnVsbCwgbm9kZS5pZCk7XG5cblx0XHRcdFx0XHQvLyBVcGRhdGUgaW5zdGFuY2VzIHdpdGggbmV3IHN0eWxlIGlkXG5cdFx0XHRcdFx0dmFyIGluc3RhbmNlcyA9IGdldEluc3RhbmNlcyhtc2cuaWQpO1xuXG5cdFx0XHRcdFx0aW5zdGFuY2VzLm1hcCgobm9kZSkgPT4ge1xuXHRcdFx0XHRcdFx0bm9kZS5zZXRQbHVnaW5EYXRhKFwic3R5bGVJZFwiLCBuZXdTdHlsZUlkKTtcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdGZpZ21hLmN1cnJlbnRQYWdlLnNlbGVjdGlvbiA9IFtub2RlXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRwb3N0TWVzc2FnZSgpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAobXNnLnR5cGUgPT09IFwiYXBwbHktc3R5bGVcIikge1xuXHRcdFx0XHRhcHBseUxheWVyU3R5bGUoZmlnbWEuY3VycmVudFBhZ2Uuc2VsZWN0aW9uLCBtc2cuaWQpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAobXNnLnR5cGUgPT09IFwicmVtb3ZlLXN0eWxlXCIpIHtcblx0XHRcdFx0cmVtb3ZlTGF5ZXJTdHlsZShtc2cuaWQpO1xuXHRcdFx0XHRwb3N0TWVzc2FnZSgpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBNYWtlIHN1cmUgdG8gY2xvc2UgdGhlIHBsdWdpbiB3aGVuIHlvdSdyZSBkb25lLiBPdGhlcndpc2UgdGhlIHBsdWdpbiB3aWxsXG5cdFx0XHQvLyBrZWVwIHJ1bm5pbmcsIHdoaWNoIHNob3dzIHRoZSBjYW5jZWwgYnV0dG9uIGF0IHRoZSBib3R0b20gb2YgdGhlIHNjcmVlbi5cblx0XHR9O1xuXHR9XG5cblx0aWYgKGZpZ21hLmNvbW1hbmQgPT09IFwiY3JlYXRlU3R5bGVzXCIpIHtcblx0XHRjcmVhdGVTdHlsZXMoZmlnbWEuY3VycmVudFBhZ2Uuc2VsZWN0aW9uKTtcblxuXHRcdGZpZ21hLmNsb3NlUGx1Z2luKCk7XG5cdH1cblxuXHRpZiAoZmlnbWEuY29tbWFuZCA9PT0gXCJ1cGRhdGVTdHlsZXNcIikge1xuXHRcdHVwZGF0ZUluc3RhbmNlcyhmaWdtYS5jdXJyZW50UGFnZS5zZWxlY3Rpb24pO1xuXHRcdGZpZ21hLmNsb3NlUGx1Z2luKCk7XG5cdH1cblxuXHRpZiAoZmlnbWEuY29tbWFuZCA9PT0gXCJjbGVhckxheWVyU3R5bGVzXCIpIHtcblx0XHRjbGVhckxheWVyU3R5bGUoKTtcblx0fVxuXG5cdGlmIChmaWdtYS5jb21tYW5kID09PSBcImNvcHlQcm9wZXJ0aWVzXCIpIHtcblx0XHRjb3B5UGFzdGVTdHlsZShmaWdtYS5jdXJyZW50UGFnZS5zZWxlY3Rpb25bMF0pO1xuXHRcdC8vIGZpZ21hLmNsb3NlUGx1Z2luKClcblx0fVxuXG5cdGlmIChmaWdtYS5jb21tYW5kID09PSBcImRldGFjaExheWVyU3R5bGVcIikge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZmlnbWEuY3VycmVudFBhZ2Uuc2VsZWN0aW9uLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgbm9kZSA9IGZpZ21hLmN1cnJlbnRQYWdlLnNlbGVjdGlvbltpXTtcblx0XHRcdGRldGFjaExheWVyU3R5bGUobm9kZSk7XG5cdFx0fVxuXHRcdGZpZ21hLm5vdGlmeShcIkxheWVyIHN0eWxlIGRldGFjaGVkXCIpO1xuXHRcdGZpZ21hLmNsb3NlUGx1Z2luKCk7XG5cdH1cbn1cbiIsImltcG9ydCBwbHVnbWFNYWluIGZyb20gJy9Vc2Vycy9nYXZpbm1jZmFybGFuZC9EZXZlbG9wZXIvcmVwb3MvZmlnbWEtbGF5ZXItc3R5bGVzL3NyYy9jb2RlL2NvZGUudHMnO1xuICAgIHBsdWdtYU1haW4oKTsiXSwibmFtZXMiOlsia2V5Iiwibm9kZSIsImRhdGEiLCJvcHRzIiwicmVjZW50RmlsZXMiLCJmaWxlIiwicmVjZW50RmlsZSIsImkiLCJyZW1vdGVGaWxlcyIsImNvcHlQYXN0ZSIsIm5vZGUyIiwiY3VzdG9tRnVuY3Rpb25zLmN1c3RvbVNob3dVSSIsImdldFBhZ2VOb2RlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLFFBQU0sY0FBYztBQUFBLElBS2xCLGNBQWM7QUFBQSxJQUVkLFdBQVc7QUFBQSxFQWtDYjtBQUVJLFdBQWUsMEJBQTBCLE1BQU07QUFBQTtBQUNqRCxZQUFNLG9CQUFvQixNQUFNLE1BQU0sY0FBYyxVQUFXO0FBQy9ELGlCQUFXQSxRQUFPLG1CQUFtQjtBQUNuQyxZQUFJQSxTQUFRLG9CQUFvQjtBQUM5QixnQkFBTSxNQUFNLGNBQWMsWUFBWUEsSUFBRztBQUN6QyxrQkFBUSxJQUFJLFlBQVlBLElBQUcsNkJBQTZCO0FBQUEsUUFDOUQ7QUFBQSxNQUNBO0FBQ0UsWUFBTSxPQUFPLHVCQUF1QjtBQUFBLElBQ3RDO0FB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

interface Options {
    include?: string[]
    exclude?: string[]
}

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



function clone(val) {
    return JSON.parse(JSON.stringify(val))
}

export function nodeRemovedByUser(node) {

    if (node) {
        if (node.parent === null || node.parent.parent === null) {
            return true
        }
        else {
            return false
        }
    }
    else {
        return true
    }

}

export function pageId(node) {
    if (node.parent.type === "PAGE") {
        return node.parent.id
    }
    else {
        return pageId(node.parent)
    }
}

export function getPageNode(node) {
    if (node.parent.type === "PAGE") {
        return node.parent
    }
    else {
        return getPageNode(node.parent)
    }
}

export function centerInViewport(node) {
    // Position newly created table in center of viewport
    node.x = figma.viewport.center.x - (node.width / 2)
    node.y = figma.viewport.center.y - (node.height / 2)
}

export function sortNodesByPosition(nodes) {

    var result = nodes.map((x) => x)

    result.sort((current, next) => current.x - next.x)

    return result.sort((current, next) => current.y - next.y);
}
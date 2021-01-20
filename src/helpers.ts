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

export function copyPasteProps(source, target?, { include, exclude }: Options = {}) {


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
        } else if (val instanceof Uint8Array) {
            return new Uint8Array(val)
        } else {
            const o: any = {}
            for (const key1 in val) {
                if (allowlist.includes(key1)) {
                    // To prevent warning about reading horizontal and vertical padding
                    if (!(key1 === "horizontalPadding" || key1 === "verticalPadding")) {
                        if (target) {
                            for (const key2 in target) {
                                if (allowlist.includes(key2)) {
                                    if (key1 === key2) {
                                        o[key1] = copyPasteProps(val[key1], target)
                                    }
                                }
                            }
                        } else {
                            o[key1] = copyPasteProps(val[key1])
                        }
                    }
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

export function pageNode(node) {
    if (node.parent.type === "PAGE") {
        return node.parent
    }
    else {
        return pageNode(node.parent)
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
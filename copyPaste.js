var source = {
    fills: 2,
    fillStyleId: "soaowlqla",
    strokes: 2,
    color: 2
}

var target = {
    fills: 1,
    fillStyleId: "",
    strokes: 1,
    backgrounds: []
}

/**
* Copy properties from one node to another.
* 
* For example:
* ```js
* const rectangle = figma.createRectangle()
* const frame = figma.createFrame()
*
* copyPaste({ rectangle, frame, exclude: ['fills'] })
* ```
* 
* This will copy and paste all properties except for `fills` and readonly properties.
* 
* @param source - Node being copied from
* @param target - Node being copied to
* @param include - Props that should be copied
* @param exclude - Props that shouldn't be copied
*/

var nodeProps = [
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
    'horizontalPadding',
    'verticalPadding',
    'layoutGrids',
    'gridStyleId',
    'clipsContent',
    'guides'
]

var readonly = [
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

function copyPasteNode({ source, target, include, exclude }) {

    var allowlist = nodeProps

    if (include) {
        allowlist = allowlist.concat(include)
    }
    else if (exclude) {
        allowlist = allowlist.filter(function (el) {
            return !exclude.concat(readonly).includes(el);
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
            return val.map(copyPasteNode)
        } else if (val instanceof Uint8Array) {
            return new Uint8Array(val)
        } else {
            const o = {}
            for (const key1 in val) {
                if (target) {
                    for (const key2 in target) {
                        if (allowlist.includes(key2)) {
                            if (key1 === key2) {
                                console.log(key1, val[key1])
                                o[key1] = copyPasteNode({ source: val[key1], target, include, exclude })
                            }
                        }
                    }
                }
                else {
                    if (allowlist.includes(key1)) {
                        o[key1] = copyPasteNode({ source: val[key1], include, exclude })
                    }
                }

            }

            if (target) {
                !o.fillStyleId && o.fills ? null : delete o.fills
                !o.strokeStyleId && o.strokes ? null : delete o.strokes
                !o.backgroundStyleId && o.backgrounds ? null : delete o.backgrounds
            }

            return target ? Object.assign(target, o) : o
        }
    }

    throw 'unknown'

}

var notStyles = [
    'x',
    'y',
    'rotation',
    'description',
    'guides',
    'remote'
]

console.log(copyPasteNode({ source, target, exclude: notStyles }))
// console.log(copyPaste({ source }))
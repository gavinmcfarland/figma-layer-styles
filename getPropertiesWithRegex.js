var string = `interface BaseNodeMixin {
    readonly id: string
    readonly parent: (BaseNode & ChildrenMixin) | null
    name: string // Note: setting this also sets autoRename to false on TextNodes
    readonly removed: boolean
    toString(): string
    remove(): void

    getPluginData(key: string): string
    setPluginData(key: string, value: string): void

    // Namespace is a string that must be at least 3 alphanumeric characters, and should
    // be a name related to your plugin. Other plugins will be able to read this data.
    getSharedPluginData(namespace: string, key: string): string
    setSharedPluginData(namespace: string, key: string, value: string): void
    setRelaunchData(data: { [command: string]: /* description */ string }): void
  }

  interface SceneNodeMixin {
    visible: boolean
    locked: boolean
  }

  interface ChildrenMixin {
    readonly children: ReadonlyArray<SceneNode>

    appendChild(child: SceneNode): void
    insertChild(index: number, child: SceneNode): void

    findChildren(callback?: (node: SceneNode) => boolean): SceneNode[]
    findChild(callback: (node: SceneNode) => boolean): SceneNode | null

    /**
     * If you only need to search immediate children, it is much faster
     * to call node.children.filter(callback) or node.findChildren(callback)
     */
    findAll(callback?: (node: SceneNode) => boolean): SceneNode[]

    /**
     * If you only need to search immediate children, it is much faster
     * to call node.children.find(callback) or node.findChild(callback)
     */
    findOne(callback: (node: SceneNode) => boolean): SceneNode | null
  }

  interface ConstraintMixin {
    constraints: Constraints
  }

  interface LayoutMixin {
    readonly absoluteTransform: Transform
    relativeTransform: Transform
    x: number
    y: number
    rotation: number // In degrees

    readonly width: number
    readonly height: number
    constrainProportions: boolean

    layoutAlign: "MIN" | "CENTER" | "MAX" | "STRETCH" | "INHERIT" // applicable only inside auto-layout frames
    layoutGrow: number

    resize(width: number, height: number): void
    resizeWithoutConstraints(width: number, height: number): void
    rescale(scale: number): void
  }

  interface BlendMixin {
    opacity: number
    blendMode: "PASS_THROUGH" | BlendMode
    isMask: boolean
    effects: ReadonlyArray<Effect>
    effectStyleId: string
  }

  interface ContainerMixin {
    expanded: boolean
    backgrounds: ReadonlyArray<Paint> // DEPRECATED: use 'fills' instead
    backgroundStyleId: string // DEPRECATED: use 'fillStyleId' instead
  }

  type StrokeCap = "NONE" | "ROUND" | "SQUARE" | "ARROW_LINES" | "ARROW_EQUILATERAL"
  type StrokeJoin = "MITER" | "BEVEL" | "ROUND"
  type HandleMirroring = "NONE" | "ANGLE" | "ANGLE_AND_LENGTH"

  interface GeometryMixin {
    fills: ReadonlyArray<Paint> | PluginAPI['mixed']
    strokes: ReadonlyArray<Paint>
    strokeWeight: number
    strokeMiterLimit: number
    strokeAlign: "CENTER" | "INSIDE" | "OUTSIDE"
    strokeCap: StrokeCap | PluginAPI['mixed']
    strokeJoin: StrokeJoin | PluginAPI['mixed']
    dashPattern: ReadonlyArray<number>
    fillStyleId: string | PluginAPI['mixed']
    strokeStyleId: string
    outlineStroke(): VectorNode | null
  }

  interface CornerMixin {
    cornerRadius: number | PluginAPI['mixed']
    cornerSmoothing: number
  }

  interface RectangleCornerMixin {
    topLeftRadius: number
    topRightRadius: number
    bottomLeftRadius: number
    bottomRightRadius: number
  }

  interface ExportMixin {
    exportSettings: ReadonlyArray<ExportSettings>
    exportAsync(settings?: ExportSettings): Promise<Uint8Array> // Defaults to PNG format
  }

  interface FramePrototypingMixin {
    overflowDirection: OverflowDirection
    numberOfFixedChildren: number

    readonly overlayPositionType: OverlayPositionType
    readonly overlayBackground: OverlayBackground
    readonly overlayBackgroundInteraction: OverlayBackgroundInteraction
  }

  interface ReactionMixin {
    readonly reactions: ReadonlyArray<Reaction>
  }

  interface PublishableMixin {
    description: string
    readonly remote: boolean
    readonly key: string // The key to use with "importComponentByKeyAsync", "importComponentSetByKeyAsync", and "importStyleByKeyAsync"
    getPublishStatusAsync(): Promise<PublishStatus>
  }

  interface DefaultShapeMixin extends
    BaseNodeMixin, SceneNodeMixin, ReactionMixin,
    BlendMixin, GeometryMixin, LayoutMixin,
    ExportMixin {
  }

  interface BaseFrameMixin extends
    BaseNodeMixin, SceneNodeMixin, ChildrenMixin,
    ContainerMixin, GeometryMixin, CornerMixin,
    RectangleCornerMixin, BlendMixin, ConstraintMixin,
    LayoutMixin, ExportMixin {

    layoutMode: "NONE" | "HORIZONTAL" | "VERTICAL"
    primaryAxisSizingMode: "FIXED" | "AUTO" // applicable only if layoutMode != "NONE"
    counterAxisSizingMode: "FIXED" | "AUTO" // applicable only if layoutMode != "NONE"

    primaryAxisAlignItems: "MIN" | "MAX" | "CENTER" | "SPACE_BETWEEN" // applicable only if layoutMode != "NONE"
    counterAxisAlignItems: "MIN" | "MAX" | "CENTER" // applicable only if layoutMode != "NONE"


    paddingLeft: number // applicable only if layoutMode != "NONE"
    paddingRight: number // applicable only if layoutMode != "NONE"
    paddingTop: number // applicable only if layoutMode != "NONE"
    paddingBottom: number // applicable only if layoutMode != "NONE"
    itemSpacing: number // applicable only if layoutMode != "NONE"

    horizontalPadding: number // DEPRECATED: use the individual paddings
    verticalPadding: number // DEPRECATED: use the individual paddings

    layoutGrids: ReadonlyArray<LayoutGrid>
    gridStyleId: string
    clipsContent: boolean
    guides: ReadonlyArray<Guide>
  }

  interface DefaultFrameMixin extends
    BaseFrameMixin,
    FramePrototypingMixin,
    ReactionMixin {}`

function getPropertiesWithRegex(string) {
    var regex = /^\s+(?:readonly\s)?(\w+):/gmi
    var regexReadOnly = /^\s+(?:readonly\s)(\w+):/gmi
    // var result = string.match(regex)
    // var result = String.prototype.matchAll(regex)
    var result = []
    // console.log(result[1])
    var array

    while ((array = regexReadOnly.exec(string)) !== null) {
        result.push(array[1])
    }
    console.log(result)
    return result
}

getPropertiesWithRegex(string)
<script lang="ts">
	import LayerIcon from './LayerIcon.svelte'
	import ContextMenu from './ContextMenu.svelte'
	import ContextMenuItem from './ContextMenuItem.svelte'
	import Input from './Input.svelte'
	import { tick } from 'svelte'
	import { onWindowBlur } from '../onWindowBlur'
	import { clickOutside } from '../clickOutside'
	interface Props {
		style: any
		currentSelection?: any
		key?: number
	}

	let { style, currentSelection, key }: Props = $props()
	let listItem: HTMLElement
	let menu: ContextMenu
	let inputComponent = $state<Input>()

	function PNGFromBuffer(buffer: ArrayBuffer) {
		const imgBase64 =
			'data:image/png;base64,' +
			btoa(
				new Uint8Array(buffer).reduce((data, byte) => {
					return data + String.fromCharCode(byte)
				}, ''),
			)
		return imgBase64
	}

	function styleCss(style: {
		node: {
			strokes?: any[]
			fills?: any[]
			cornerRadius?: number
			topLeftRadius?: number
			topRightRadius?: number
			bottomRightRadius?: number
			bottomLeftRadius?: number
			effects?: any[]
			dashPattern?: number[]
			strokeWeight?: number
			strokeTopWeight?: number
			strokeBottomWeight?: number
			strokeRightWeight?: number
			strokeLeftWeight?: number
		}
	}) {
		var string = ''
		var border = ''
		var background = ''
		var backgroundRgba = ''
		var borderRgba = ''
		var borderWeight = ''
		var borderRadius = ''
		var boxShadow = ''
		var imageBg = ''

		// if (style.base64 || style.arrayBuffer) {
		//     console.log(PNGFromBuffer(style.arrayBuffer));
		//     imageBg = `background-image: url(${style.base64}); background-size: contain;`;
		// }

		if (style.node.strokes && style.node.strokes.length > 0) {
			if (style.node.strokes[0].visible) {
				borderRgba = `rgba(${style.node.strokes[0].color.r * 255}, ${
					style.node.strokes[0].color.g * 255
				}, ${style.node.strokes[0].color.b * 255}, ${style.node.strokes[0].opacity})`

				var borderStyle = 'solid'

				if (style.node.dashPattern && style.node.dashPattern.length > 0) {
					borderStyle = 'dashed'
				}

				// Check if we have directional stroke weights
				const hasDirectionalStrokes =
					style.node.strokeTopWeight !== undefined ||
					style.node.strokeBottomWeight !== undefined ||
					style.node.strokeRightWeight !== undefined ||
					style.node.strokeLeftWeight !== undefined

				if (hasDirectionalStrokes) {
					// Use individual border properties for directional strokes
					const topWeight = style.node.strokeTopWeight ?? style.node.strokeWeight ?? 0
					const bottomWeight = style.node.strokeBottomWeight ?? style.node.strokeWeight ?? 0
					const rightWeight = style.node.strokeRightWeight ?? style.node.strokeWeight ?? 0
					const leftWeight = style.node.strokeLeftWeight ?? style.node.strokeWeight ?? 0

					border = `border-top: ${topWeight}px ${borderStyle} ${borderRgba}; border-bottom: ${bottomWeight}px ${borderStyle} ${borderRgba}; border-right: ${rightWeight}px ${borderStyle} ${borderRgba}; border-left: ${leftWeight}px ${borderStyle} ${borderRgba};`
				} else {
					// Use single border property for uniform stroke weight
					borderWeight = `${style.node.strokeWeight}px`
					border = `border: ${borderWeight} ${borderStyle} ${borderRgba};`
				}
			}
		}

		if (style.node.fills && style.node.fills.length > 0) {
			var fills = []
			for (let i = 0; i < style.node.fills.length; i++) {
				var fill = style.node.fills[i]

				if (fill.type === 'SOLID') {
					fills.push(
						`linear-gradient( rgba(${fill.color.r * 255}, ${
							fill.color.g * 255
						}, ${fill.color.b * 255}, ${fill.opacity}),
                    rgba(${fill.color.r * 255}, ${fill.color.g * 255}, ${fill.color.b * 255}, ${fill.opacity}))`,
					)
				}
			}

			background = `background-image: ${fills.reverse().join(', ')};`
		}

		if (style.node.cornerRadius) {
			borderRadius = `border-radius: ${style.node.cornerRadius / 2}px;`
		} else {
			borderRadius = `border-radius: ${(style.node.topLeftRadius ?? 0) / 3}px ${
				(style.node.topRightRadius ?? 0) / 3
			}px ${(style.node.bottomRightRadius ?? 0) / 3}px ${(style.node.bottomLeftRadius ?? 0) / 3}px;`
		}

		if (style.node.effects) {
			var boxShadows = []
			for (let i = 0; i < style.node.effects.length; i++) {
				var effect = style.node.effects[i]

				if (effect.type === 'DROP_SHADOW') {
					boxShadows.push(
						`${effect.offset.x / 2}px ${effect.offset.y / 2}px ${
							effect.radius / 2
						}px rgba(${effect.color.r * 255}, ${
							effect.color.g * 255
						}, ${effect.color.b * 255}, ${effect.color.a})`,
					)
				}

				if (effect.type === 'INNER_SHADOW') {
					boxShadows.push(
						`inset ${effect.offset.x / 2}px ${effect.offset.y / 2}px ${effect.radius / 2}px rgba(${
							effect.color.r * 255
						}, ${effect.color.g * 255}, ${effect.color.b * 255}, ${effect.color.a})`,
					)
				}
			}

			// filter: drop-shadow(30px 10px 4px #4444dd)

			boxShadow = `box-shadow: ${boxShadows.join(' ')};`
		}

		string = `${background} ${border} ${borderRadius} ${boxShadow} ${imageBg}`

		return string
	}

	let showField = $state(false)
	let styleBeingEdited = $state({
		name: '',
	})

	function updateInstances(id: string, event?: MouseEvent) {
		if (event) {
			event.stopPropagation()
		}
		parent.postMessage(
			{
				pluginMessage: {
					type: 'update-instances',
					id,
				},
			},
			'*',
		)
		menu.closeMenu()
	}

	function applyStyle(id: string) {
		parent.postMessage(
			{
				pluginMessage: {
					type: 'apply-style',
					id,
				},
			},
			'*',
		)
	}

	function updateLayerStyle(id: string, event?: MouseEvent) {
		if (event) {
			event.stopPropagation()
		}
		parent.postMessage(
			{
				pluginMessage: {
					type: 'update-style',
					id,
				},
			},
			'*',
		)
		menu.closeMenu()
	}

	function editLayerStyle(id: string, event?: MouseEvent) {
		if (event) {
			event.stopPropagation()
		}
		parent.postMessage(
			{
				pluginMessage: {
					type: 'edit-layer-style',
					id,
				},
			},
			'*',
		)
		menu.closeMenu()
	}

	function removeStyle(id: string, event?: MouseEvent) {
		// Prevent event from bubbling up to parent list item
		if (event) {
			event.stopPropagation()
		}

		parent.postMessage(
			{
				pluginMessage: {
					type: 'remove-style',
					id,
				},
			},
			'*',
		)
		menu.closeMenu()
	}

	function renameStyle(id: string, name: string, event?: MouseEvent) {
		if (event) {
			event.stopPropagation()
		}
		console.log('renameStyle', id, name)
		parent.postMessage(
			{
				pluginMessage: {
					type: 'rename-style',
					id,
					name,
				},
			},
			'*',
		)
		menu.closeMenu()
	}

	async function editStyle(event: MouseEvent, style: { id: string; name: string }) {
		// Prevent event from bubbling up to parent list item
		event.stopPropagation()

		menu.closeMenu()
		showField = true
		listItem.classList.add('blue-bg')

		await tick()
		let input = inputComponent?.getInputRef()

		if (input) {
			input.focus()
			clickOutside(input, () => {
				showField = false
			})
		}

		onWindowBlur(() => {
			showField = false
		})
	}

	$effect(() => {
		if (currentSelection.styleId === style.id) {
			listItem.classList.add('selected')
		} else {
			listItem.classList.remove('selected')
		}
	})
</script>

<svelte:body />

<div
	tabindex="0"
	class="list-item"
	style="position: relative;"
	id="listItem{key}"
	data-style-id={style.id}
	bind:this={listItem}
	oncontextmenu={(e) => menu.openMenu(e, style)}
	role="button"
	onclick={() => applyStyle(style.id)}
	onkeydown={(e) => e.key === 'Enter' && applyStyle(style.id)}
>
	<div role="button" tabindex="0" style="display: flex; flex-grow: 1;">
		<div style="display: flex; align-items: center; gap: var(--spacer-2);">
			<LayerIcon style={styleCss(style)} />
			<div class="field" style="flex-grow: 1;">
				{#if showField}
					<Input
						style="margin-left: -8px"
						bind:this={inputComponent}
						id="editNameField"
						bind:value={style.name}
						onkeydown={(e: KeyboardEvent) => {
							if (e.key === 'Enter') {
								e.stopPropagation()
								showField = false
							}
						}}
						oninput={() => {
							renameStyle(style.id, style.name)
						}}
					/>
				{:else}
					<span>{style.name}</span>
				{/if}
			</div>
		</div>
	</div>

	<ContextMenu bind:this={menu}>
		<ContextMenuItem onClick={(e: MouseEvent) => updateInstances(style.id, e)}>Refresh</ContextMenuItem>
		<ContextMenuItem onClick={(e: MouseEvent) => editLayerStyle(style.id, e)}>Edit style</ContextMenuItem>
		<ContextMenuItem onClick={(e: MouseEvent) => editStyle(e, style)}>Rename</ContextMenuItem>
		<div class="divider"></div>
		<ContextMenuItem onClick={(e: MouseEvent) => removeStyle(style.id, e)}>Delete</ContextMenuItem>
	</ContextMenu>
</div>

<style lang="ts">
	.list-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: var(--font-size-default);
		padding-inline: var(--spacer-3);
		height: 32px;

		&:hover {
			background-color: var(--figma-color-bg-hover);
		}
	}

	.divider {
		border-top: 1px solid rgba(255, 255, 255, 0.2);
		display: block;
		margin-top: 8px;
		margin-bottom: 8px;
	}
</style>

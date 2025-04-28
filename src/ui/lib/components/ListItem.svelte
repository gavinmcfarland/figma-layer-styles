<script lang="ts">
	import { fade } from 'svelte/transition'
	import LayerIcon from './LayerIcon.svelte'
	import ContextMenu from './ContextMenu.svelte'
	import ContextMenuItem from './ContextMenuItem.svelte'

	interface Props {
		// ListItem
		style: any
	}

	let { style }: Props = $props()
	let listItem: HTMLElement
	let menu: ContextMenu

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

				borderWeight = `${style.node.strokeWeight}px`
				border = `border: ${borderWeight} ${borderStyle} ${borderRgba};`
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

	let field: HTMLElement

	let styleBeingEdited = $state({
		name: '',
	})

	function updateInstances(id: string) {
		parent.postMessage(
			{
				pluginMessage: {
					type: 'update-instances',
					id,
				},
			},
			'*',
		)
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

	function updateLayerStyle(id: string) {
		parent.postMessage(
			{
				pluginMessage: {
					type: 'update-style',
					id,
				},
			},
			'*',
		)
	}

	function editLayerStyle(id: string) {
		parent.postMessage(
			{
				pluginMessage: {
					type: 'edit-layer-style',
					id,
				},
			},
			'*',
		)
	}

	function removeStyle(id: string) {
		parent.postMessage(
			{
				pluginMessage: {
					type: 'remove-style',
					id,
				},
			},
			'*',
		)
	}

	function renameStyle(id: string, name: string) {
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
	}

	function editStyle(event: MouseEvent, style: { id: string; name: string }) {
		styleBeingEdited = style

		var editName = listItem.querySelector('.editName')
		var input = listItem.querySelector('input')
		editName?.classList.add('show')
		listItem.classList.add('blue-bg')

		input?.focus()
		// input.addEventListener("focus", () => {
		//     input.select();
		// });
		// input.focus();
		// input.select();

		// input?.addEventListener('keyup', function (event) {
		// 	// Number 13 is the "Enter" key on the keyboard
		// 	if (event.keyCode === 13) {
		// 		// Cancel the default action, if needed
		// 		event.preventDefault()

		// 		renameStyle(styleBeingEdited.id, styleBeingEdited.name)
		// 		document.activeElement?.blur()
		// 		hideInput()
		// 		// Trigger the button element with a click
		// 		// document.getElementById("myBtn").click();
		// 	}
		// })
	}

	function hideInput() {
		if (listItem) field.classList.remove('show')
		// if (listItem) renameStyle(styleBeingEdited.id, styleBeingEdited.name);
	}
</script>

<svelte:body />

<div
	tabindex="0"
	class="list-item"
	style="position: relative;"
	id="listItem{style.id}"
	bind:this={listItem}
	oncontextmenu={(e) => menu.openMenu(e, style)}
	role="button"
>
	<div
		role="button"
		tabindex="0"
		onclick={() => applyStyle(style.id)}
		style="display: flex; flex-grow: 1;"
		onkeydown={(e) => e.key === 'Enter' && applyStyle(style.id)}
	>
		<div style="display: flex; align-items: center; gap: var(--spacer-1);">
			<LayerIcon style={styleCss(style)} />
			<div class="field flex place-center" style="flex-grow: 1;">
				<div bind:this={field} class="editName" transition:fade={{ duration: 100 }}>
					<input bind:value={styleBeingEdited.name} class="mb-xxsmall" />
				</div>
				<span>{style.name}</span>
			</div>
		</div>
	</div>

	<ContextMenu bind:this={menu}>
		<ContextMenuItem onClick={updateInstances(style.id)}>Refresh</ContextMenuItem>
		<ContextMenuItem onClick={() => editLayerStyle(style.id)}>Edit</ContextMenuItem>
		<ContextMenuItem onClick={(e: MouseEvent) => editStyle(e, style)}>Rename</ContextMenuItem>
		<ContextMenuItem onClick={() => removeStyle(style.id)}>Delete</ContextMenuItem>
	</ContextMenu>
</div>

<style lang="ts">
	.list-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: var(--font-size-default);
		padding-inline: var(--spacer-2);
		height: 32px;

		&:hover {
			background-color: var(--figma-color-bg-hover);
		}
	}

	.editName {
		display: none;
	}
</style>

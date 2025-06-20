<script lang="ts">
	import LayerIcon from './LayerIcon.svelte'
	import ContextMenu from './ContextMenu.svelte'
	import ContextMenuItem from './ContextMenuItem.svelte'
	import Input from './Input.svelte'
	import { tick } from 'svelte'
	import { onWindowBlur } from '../onWindowBlur'
	import { clickOutside } from '../clickOutside'
	import { selectedStyles } from '../stores'
	interface Props {
		style: any
		styles: any[]
		currentSelection?: any
		key?: number
	}

	let { style, styles, currentSelection, key }: Props = $props()
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

					border = `border-top: ${topWeight / 1.5}px ${borderStyle} ${borderRgba}; border-bottom: ${bottomWeight / 1.5}px ${borderStyle} ${borderRgba}; border-right: ${rightWeight / 1.5}px ${borderStyle} ${borderRgba}; border-left: ${leftWeight / 1.5}px ${borderStyle} ${borderRgba};`
				} else {
					// Use single border property for uniform stroke weight
					borderWeight = `${style.node.strokeWeight / 1.5}px`
					border = `border: ${borderWeight} ${borderStyle} ${borderRgba};`
				}
			}
		}

		if (style.node.fills && style.node.fills.length > 0) {
			var fills = []
			var solidBackground = null

			for (let i = 0; i < style.node.fills.length; i++) {
				var fill = style.node.fills[i]

				if (fill.type === 'SOLID') {
					// For solid fills, use background-color instead of gradient
					const r = Math.round(fill.color.r * 255)
					const g = Math.round(fill.color.g * 255)
					const b = Math.round(fill.color.b * 255)
					const opacity = fill.opacity ?? 1

					solidBackground = `background-color: rgba(${r}, ${g}, ${b}, ${opacity});`
				} else if (fill.type === 'GRADIENT_LINEAR') {
					// Handle linear gradients
					if (fill.gradientStops && fill.gradientStops.length > 0) {
						const stops = fill.gradientStops
							.map((stop: any) => {
								const r = Math.round(stop.color.r * 255)
								const g = Math.round(stop.color.g * 255)
								const b = Math.round(stop.color.b * 255)
								const a = stop.color.a ?? 1
								const position = Math.round(stop.position * 100)
								return `rgba(${r}, ${g}, ${b}, ${a}) ${position}%`
							})
							.join(', ')

						// Calculate gradient direction from gradientTransform
						let direction = 'to right' // default
						if (fill.gradientTransform && fill.gradientTransform.length >= 2) {
							const transform = fill.gradientTransform

							// Debug: Log the transform matrix
							// console.log('Gradient transform:', transform)

							// Use the helper function with method B (most common)
							// You can change this to 'A', 'C', or 'D' to test different approaches
							direction = calculateGradientDirection(transform, 'B')

							// Log all possible directions for debugging
							// console.log('All gradient directions:', {
							// 	A: calculateGradientDirection(transform, 'A'),
							// 	B: calculateGradientDirection(transform, 'B'),
							// 	C: calculateGradientDirection(transform, 'C'),
							// 	D: calculateGradientDirection(transform, 'D'),
							// })
						}

						fills.push(`linear-gradient(${direction}, ${stops})`)
					}
				} else if (fill.type === 'GRADIENT_RADIAL') {
					// Handle radial gradients
					if (fill.gradientStops && fill.gradientStops.length > 0) {
						const stops = fill.gradientStops
							.map((stop: any) => {
								const r = Math.round(stop.color.r * 255)
								const g = Math.round(stop.color.g * 255)
								const b = Math.round(stop.color.b * 255)
								const a = stop.color.a ?? 1
								const position = Math.round(stop.position * 100)
								return `rgba(${r}, ${g}, ${b}, ${a}) ${position}%`
							})
							.join(', ')

						fills.push(`radial-gradient(circle, ${stops})`)
					}
				} else if (fill.type === 'GRADIENT_ANGULAR') {
					// Handle angular/conic gradients
					if (fill.gradientStops && fill.gradientStops.length > 0) {
						const stops = fill.gradientStops
							.map((stop: any) => {
								const r = Math.round(stop.color.r * 255)
								const g = Math.round(stop.color.g * 255)
								const b = Math.round(stop.color.b * 255)
								const a = stop.color.a ?? 1
								const position = Math.round(stop.position * 360)
								return `rgba(${r}, ${g}, ${b}, ${a}) ${position}deg`
							})
							.join(', ')

						fills.push(`conic-gradient(${stops})`)
					}
				} else if (fill.type === 'IMAGE') {
					// Handle image fills
					if (fill.imageRef) {
						// Note: In a real implementation, you'd need to get the actual image URL
						// from Figma's API. For now, we'll use a placeholder
						fills.push(
							`url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23ccc"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%23666">IMG</text></svg>')`,
						)
					}
				}
			}

			// Use solid background if available, otherwise use gradients
			if (solidBackground) {
				background = solidBackground
				if (fills.length > 0) {
					background += ` background-image: ${fills.reverse().join(', ')};`
				}
			} else if (fills.length > 0) {
				background = `background-image: ${fills.reverse().join(', ')};`
			}
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
		// console.log('renameStyle', id, name)
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

	function handleItemClick(event: MouseEvent) {
		// If Ctrl/Cmd key is pressed, toggle individual selection
		if (event.ctrlKey || event.metaKey) {
			toggleSelection(event)
			return
		}

		// If Shift key is pressed, select range
		if (event.shiftKey) {
			selectRange(event)
			return
		}

		// Normal click: clear selection and apply this style
		selectedStyles.update((currentStyles) => {
			if (currentStyles && currentStyles.length > 0) {
				return []
			}
			return currentStyles
		})

		applyStyle(style.id)
	}

	function toggleSelection(event: MouseEvent) {
		event.stopPropagation()
		selectedStyles.update((currentStyles) => {
			if (!currentStyles) {
				return [style.id]
			}

			const index = currentStyles.indexOf(style.id)
			if (index > -1) {
				return currentStyles.filter((id) => id !== style.id)
			} else {
				return [...currentStyles, style.id]
			}
		})
	}

	function selectRange(event: MouseEvent) {
		event.stopPropagation()
		selectedStyles.update((currentStyles) => {
			if (!currentStyles) {
				return [style.id]
			}

			// Get all style IDs from the parent component
			const allStyleIds = styles.map((s: any) => s.id)
			const currentIndex = allStyleIds.indexOf(style.id)

			// Find the last selected item to determine range
			let lastSelectedIndex = -1
			for (let i = 0; i < allStyleIds.length; i++) {
				if (currentStyles.includes(allStyleIds[i])) {
					lastSelectedIndex = i
				}
			}

			if (lastSelectedIndex === -1) {
				// If no previous selection, just select this item
				return [style.id]
			} else {
				// Select range from last selected to current
				const start = Math.min(lastSelectedIndex, currentIndex)
				const end = Math.max(lastSelectedIndex, currentIndex)

				// Add all items in range to selection
				const newSelection = [...currentStyles]
				for (let i = start; i <= end; i++) {
					const styleId = allStyleIds[i]
					if (!newSelection.includes(styleId)) {
						newSelection.push(styleId)
					}
				}
				return newSelection
			}
		})
	}

	function deleteSelectedStyles(event: MouseEvent) {
		event.stopPropagation()
		selectedStyles.update((currentStyles) => {
			if (currentStyles && currentStyles.length > 0) {
				currentStyles.forEach((styleId) => {
					parent.postMessage(
						{
							pluginMessage: {
								type: 'remove-style',
								id: styleId,
							},
						},
						'*',
					)
				})
			}
			return []
		})
		menu.closeMenu()
	}

	function refreshSelectedStyles(event: MouseEvent) {
		event.stopPropagation()
		selectedStyles.update((currentStyles) => {
			if (currentStyles && currentStyles.length > 0) {
				currentStyles.forEach((styleId) => {
					parent.postMessage(
						{
							pluginMessage: {
								type: 'update-instances',
								id: styleId,
							},
						},
						'*',
					)
				})
			}
			return currentStyles
		})
		menu.closeMenu()
	}

	$effect(() => {
		if ($selectedStyles && $selectedStyles.includes(style.id)) {
			if (listItem) {
				listItem.classList.add('multi-selected')
				// console.log('Added multi-selected class to:', style.name)
			}
		} else {
			if (listItem) {
				listItem.classList.remove('multi-selected')
				// console.log('Removed multi-selected class from:', style.name)
			}
		}
	})

	// Helper function to calculate gradient direction from Figma's gradientTransform
	function calculateGradientDirection(transform: number[][], method: 'A' | 'B' | 'C' | 'D' = 'B'): string {
		try {
			const dx = transform[0][0]
			const dy = transform[0][1]

			// Calculate the angle in degrees
			const angle = Math.atan2(dy, dx) * (180 / Math.PI)

			// Normalize angle to be between 0 and 360
			const normalizedAngle = ((angle % 360) + 360) % 360

			let cssAngle: number

			switch (method) {
				case 'A':
					cssAngle = normalizedAngle // No adjustment
					break
				case 'B':
					cssAngle = (normalizedAngle + 90) % 360 // Add 90 degrees
					break
				case 'C':
					cssAngle = (normalizedAngle - 90 + 360) % 360 // Subtract 90 degrees
					break
				case 'D':
					cssAngle = (normalizedAngle + 180) % 360 // Flip the angle
					break
				default:
					cssAngle = (normalizedAngle + 90) % 360
			}

			return `${cssAngle}deg`
		} catch (error) {
			console.warn('Failed to calculate gradient direction:', error)
			return 'to right'
		}
	}

	function generateCSS(style: any) {}
</script>

<svelte:body />

<div
	tabindex="0"
	class="list-item"
	class:selected={currentSelection.styleId === style.id}
	class:multi-selected={$selectedStyles && $selectedStyles.includes(style.id)}
	style="position: relative;"
	id="listItem{key}"
	data-style-id={style.id}
	bind:this={listItem}
	oncontextmenu={(e) => {
		// If this layer isn't selected and there are other selected layers, deselect all
		selectedStyles.update((currentStyles) => {
			if (currentStyles && currentStyles.length > 0 && !currentStyles.includes(style.id)) {
				return []
			}
			return currentStyles
		})

		// Open menu immediately
		menu.openMenu(e, style)
	}}
	role="button"
	onclick={handleItemClick}
	onkeydown={(e) => e.key === 'Enter' && applyStyle(style.id)}
>
	<!-- Selection indicator -->
	<!-- {#if selectedStyles && selectedStyles.includes(style.id)}
		<div class="selection-indicator">
			<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
				<path
					d="M2 6L5 9L10 3"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</div>
	{/if} -->

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
		{#if $selectedStyles && $selectedStyles.length > 1}
			<!-- Bulk actions for multiple selections -->
			<!-- <div class="selection-count">{$selectedStyles.length} selected</div> -->
			<ContextMenuItem onClick={(e: MouseEvent) => refreshSelectedStyles(e)}>Refresh</ContextMenuItem>
			<div class="divider"></div>
			<ContextMenuItem onClick={(e: MouseEvent) => deleteSelectedStyles(e)}>Delete</ContextMenuItem>
		{:else}
			<!-- Individual actions for single selection -->
			<ContextMenuItem onClick={(e: MouseEvent) => updateInstances(style.id, e)}>Refresh</ContextMenuItem>
			<ContextMenuItem onClick={(e: MouseEvent) => editLayerStyle(style.id, e)}>Edit style</ContextMenuItem>
			<ContextMenuItem onClick={(e: MouseEvent) => editStyle(e, style)}>Rename</ContextMenuItem>
			<div class="divider"></div>
			<ContextMenuItem onClick={(e: MouseEvent) => removeStyle(style.id, e)}>Delete</ContextMenuItem>
		{/if}
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
		position: relative;
		border-left: 3px solid transparent;

		&:hover {
			background-color: var(--figma-color-bg-hover);
		}

		&.selected {
			background-color: var(--figma-color-bg-selected);
		}

		&.multi-selected {
			background-color: var(--figma-color-bg-selected);
		}

		&.multi-selected:hover {
			background-color: var(--figma-color-bg-selected-hover);
		}
	}

	.selection-indicator {
		position: absolute;
		left: 8px;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
		background-color: var(--figma-color-bg-brand);
		border-radius: 50%;
		color: var(--figma-color-text-onbrand);
		z-index: 1;
	}

	.divider {
		border-top: 1px solid rgba(255, 255, 255, 0.2);
		display: block;
		margin-top: 8px;
		margin-bottom: 8px;
	}

	.selection-count {
		color: var(--figma-color-text-bg);
		font-size: 11px;
		padding: 8px 12px;
		padding-top: 0px;
		padding-bottom: 8px;
		text-align: center;
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		margin-bottom: 4px;
	}
</style>

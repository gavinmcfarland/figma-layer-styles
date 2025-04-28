<script lang="ts">
	import { onMount, onDestroy } from 'svelte'
	import { contextMenus } from '../stores'
	import { clickOutside } from '../clickOutside'
	import { onWindowBlur } from '../onWindowBlur'
	let { children, id } = $props()
	let menu = $state<HTMLElement>()

	let mousePosX = $state(0)
	let mousePosY = $state(0)

	onMount(() => {
		// Generate a random ID if none is provided
		if (!id) {
			id = 'context-menu-' + Math.random().toString(36).substr(2, 9)
		}

		contextMenus.update((state) => {
			if (!state.some((menu: { id: string }) => menu.id === id)) {
				// Add new button state
				return [...state, { id }]
			}
			return state
		})
	})

	export function closeMenu() {
		menu?.classList.remove('show')
	}

	export function closeAllMenus() {
		$contextMenus.forEach((menuState: { id: string }) => {
			const menuElement = document.getElementById(menuState.id)
			if (menuElement) {
				menuElement.classList.remove('show')
			}
		})
	}

	export function openMenu(event: MouseEvent, style: string) {
		closeAllMenus() // Close all menus first
		event.preventDefault()
		const target = event.currentTarget as HTMLElement
		let rect = target.getBoundingClientRect()
		target.classList.toggle('selected')

		mousePosX = event.clientX - rect.left
		mousePosY = event.clientY - rect.top

		if (mousePosX > 140) {
			mousePosX = 136
			console.log('off screen')
		}
		if (rect.top > 231) {
			mousePosY = -40
			console.log('off screen')
		}

		menu?.classList.toggle('show')
	}

	onMount(() => {
		if (menu) {
			clickOutside(menu, () => {
				closeMenu()
			})
		}
		onWindowBlur(() => {
			closeAllMenus()
			// hideInput()
		})
	})
</script>

<div class="context-menu" bind:this={menu} {id} style="left: {mousePosX}px; top: {mousePosY}px">
	<div class="triangle"></div>
	{@render children?.()}
</div>

<style>
	.context-menu {
		display: none;
		color: #fff;
		padding: 8px 0;
		z-index: 100;
		background: #222222;
		box-shadow:
			0px 2px 7px rgba(0, 0, 0, 0.15),
			0px 5px 17px rgba(0, 0, 0, 0.2);
		border-radius: 2px;
		width: 100px;
		position: absolute;
		z-index: 100;
	}

	:global(.list-item.selected, .list-item.list-item.selected:hover) {
		background: var(--figma-color-bg-selected);
	}

	:global(.context-menu.show) {
		display: block;
	}
</style>

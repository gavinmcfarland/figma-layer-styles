<script lang="ts">
	import { onMount, onDestroy } from 'svelte'
	import { contextMenus } from '../stores'
	import { clickOutside } from '../clickOutside'
	import { onWindowBlur } from '../onWindowBlur'
	let { children, id } = $props()
	let menu = $state()

	let mousePosX = $state(0)
	let mousePosY = $state(0)

	onMount(() => {
		// Generate a random ID if none is provided
		if (!id) {
			id = 'context-menu-' + Math.random().toString(36).substr(2, 9)
		}

		contextMenus.update((state) => {
			if (!state.some((menu) => menu.id === id)) {
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
		$contextMenus.forEach((menuState) => {
			const menuElement = document.getElementById(menuState.id)
			if (menuElement) {
				menuElement.classList.remove('show')
			}
		})
	}

	export function openMenu(event, style) {
		closeAllMenus() // Close all menus first
		event.preventDefault()
		let rect = event.currentTarget.getBoundingClientRect()
		event.currentTarget.classList.toggle('blue-bg')

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

		menu.classList.toggle('show')
	}

	onMount(() => {
		clickOutside(menu, () => {
			closeMenu()
		})
		onWindowBlur(() => {
			// Your custom blur handling logic here
			closeAllMenus()
			// hideInput()
			// if (listItem) listItem.classList.remove('blue-bg')
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
	}

	:global(.context-menu.show) {
		display: block;
	}
</style>

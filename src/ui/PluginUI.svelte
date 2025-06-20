<script lang="ts">
	import { fade } from 'svelte/transition'
	import { onMount } from 'svelte'
	import Styles from './Styles.svelte'
	import { IconButton, Button } from '@figma-ui/mono-repo/library/packages/svelte'
	import '@figma-ui/mono-repo/library/packages/styles'
	import { selectedStyles } from './lib/stores'
	import { clickOutside } from './lib/clickOutside'

	function addStyle() {
		parent.postMessage(
			{
				pluginMessage: {
					type: 'add-style',
				},
			},
			'*',
		)
	}

	function handleClickOutside() {
		// console.log('Click outside detected, clearing selection')
		selectedStyles.set([])
		// console.log('Selection cleared, current store value:', $selectedStyles)
	}

	var styles = $state([])
	var currentSelection = $state([])
	var stylesLoaded = $state(false)
	let stylesContainer: HTMLElement
	let clickOutsideUnsubscribe: any

	parent.postMessage(
		{
			pluginMessage: { type: 'UI_READY' },
		},
		'*',
	)

	onMount(() => {
		window.onmessage = (event) => {
			if (event.data.pluginMessage.type === 'STYLE_LIST') {
				styles = event.data.pluginMessage.styles
				stylesLoaded = true
			}

			if (event.data.pluginMessage.type === 'CURRENT_SELECTION') {
				currentSelection = event.data.pluginMessage.selection
			}
		}
	})

	// Set up click outside handler when stylesContainer is available
	$effect(() => {
		if (stylesContainer) {
			// Clean up previous handler if it exists
			if (clickOutsideUnsubscribe) {
				clickOutsideUnsubscribe.destroy()
			}

			// Set up new handler
			clickOutsideUnsubscribe = clickOutside(stylesContainer, handleClickOutside)
		}
	})
</script>

<!-- <svelte:window onmessage={onLoad} /> -->

<div
	class="app-container"
	onclick={(e) => {
		// If click is on the main container (not on styles), clear selection
		// console.log('clicking container')
		// if (e.target === e.currentTarget) {
		// console.log('Main container clicked, clearing selection')
		selectedStyles.set([])
		// console.log('Selection cleared from main container, current store value:', $selectedStyles)
		// }
	}}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			selectedStyles.set([])
		}
	}}
	tabindex="0"
>
	{#if stylesLoaded && styles.length > 0}
		<div class="styles" bind:this={stylesContainer}>
			<Styles {styles} {currentSelection} />
		</div>
	{:else if stylesLoaded && styles.length === 0}
		<div class="no-styles">
			<p class="text">Select a layer<br /> to create a style from</p>
		</div>
	{/if}

	<div class="action-bar">
		<div class="spacer"></div>
		<IconButton icon="plus" onClick={addStyle} />
	</div>
</div>

<style lang="ts">
	.app-container {
		height: 100%;
	}
	.action-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacer-2);
		border-top: 1px solid var(--figma-color-border);
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 50;
		height: 40px;
		background-color: var(--figma-color-bg);
	}

	.styles {
		padding-top: var(--spacer-2);
		padding-bottom: 40px;
	}

	.no-styles {
		padding-top: var(--spacer-2);
		padding-bottom: 40px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		gap: var(--spacer-2);
	}

	.spacer {
		flex-grow: 1;
	}

	.text {
		font-size: 11px;
		color: var(--figma-color-text-secondary);
		letter-spacing: var(--letter-spacing-default);
		text-align: center;
		line-height: var(--line-height-default);
	}
</style>

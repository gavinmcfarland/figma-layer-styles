<script>
	import { fade } from "svelte/transition";
	//import Global CSS from the svelte boilerplate
	//contains Figma color vars, spacing vars, utility classes and more
	import { GlobalCSS } from "figma-plugin-ds-svelte";

	//import some Svelte Figma UI components
	import {
		Button,
		Input,
		Label,
		SelectMenu,
		Type,
		IconButton,
		Icon,
		IconMinus,
		IconSwap,
		IconPlus,
		IconEllipses,
	} from "figma-plugin-ds-svelte";
	import { onMount } from "svelte";

	import Styles from "./Styles.svelte";

	//menu items, this is an array of objects to populate to our select menus
	let menuItems = [
		{
			value: "rectangle",
			label: "Rectangle",
			group: null,
			selected: false,
		},
		{ value: "triangle", label: "Triangle ", group: null, selected: false },
		{ value: "circle", label: "Circle", group: null, selected: false },
	];

	// var disabled = true;
	var selectedShape;
	var count = 5;

	//this is a reactive variable that will return false when a value is selected from
	//the select menu, its value is bound to the primary buttons disabled prop
	// $: disabled = selectedShape === null;

	function createShapes() {
		parent.postMessage(
			{
				pluginMessage: {
					type: "create-shapes",
					count: count,
					shape: selectedShape.value,
				},
			},
			"*"
		);
	}

	function addStyle() {
		parent.postMessage(
			{
				pluginMessage: {
					type: "add-style",
				},
			},
			"*"
		);
	}

	function cancel() {
		parent.postMessage({ pluginMessage: { type: "cancel" } }, "*");
	}

	var styles = [];

	async function onLoad(event) {
		styles = await event.data.pluginMessage;
	}
</script>

<style>
	/* Add additional global or scoped styles here */
	:global(.bb) {
		border-bottom: 1px solid var(--grey);
	}
	:global(.bt) {
		border-top: 1px solid var(--grey);
	}
	:global(.place-center) {
		align-items: center;
	}
	:global(.list-item) {
		height: 32px;
	}

	.action-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		place-content: flex-end;
	}

	/* :gloabl(.action-bar > *) {
		margin-left: 8px;
	}

	:global(.action-bar > *:first-child) {
		margin-left: 0;
	} */

	.wrapper {
		height: 100%;
	}

	:global(.show) {
		display: block !important;
	}
</style>

<svelte:window on:message={onLoad} />

<!-- <div class="bt" style="display: hidden" /> -->

<div class="wrapper p-xxsmall" transition:fade={{ duration: 100 }}>
	<!-- <Label>Shape</Label>
	<SelectMenu bind:menuItems bind:value={selectedShape} class="mb-xxsmall" />

	<Label>Count</Label>
	<Input iconText="#" bind:value={count} class="mb-xxsmall" /> -->
	<Styles {styles} />

	<div class="action-bar flex p-xxsmall bt">
		<!-- <Button on:click={cancel} variant="secondary" class="mr-xsmall">
			Cancel
		</Button> -->
		<!-- <Button on:click={createShapes} bind:disabled>Create shapes</Button> -->
		<!-- <Button on:click={addStyle}>Add style</Button> -->
		<IconButton
			class="IconButton"
			on:click={addStyle}
			iconName={IconPlus} />
	</div>
</div>
<!-- {#if showRename}
	<div class="editName wrapper p-xxsmall" transition:fade={{ duration: 100 }}>
		<Input bind:value={styleBeingEdited.name} class="mb-xxsmall" />

		<div class="action-bar flex p-xxsmall bt">
			<Button
				variant="secondary"
				on:click={() => {
					showRename = false;
				}}>
				Cancel
			</Button>
			<Button
				class="ml-xxsmall"
				on:click={() => {
					renameStyle(styleBeingEdited.id, styleBeingEdited.name);
					showRename = false;
				}}>
				Rename
			</Button>
		</div>
	</div>
{/if} -->

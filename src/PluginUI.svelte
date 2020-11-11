<script>
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
	} from "figma-plugin-ds-svelte";
	import { onMount } from "svelte";

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

	function updateInstances(id) {
		parent.postMessage(
			{
				pluginMessage: {
					type: "update-instances",
					id,
				},
			},
			"*"
		);
	}

	function applyStyle(id) {
		parent.postMessage(
			{
				pluginMessage: {
					type: "apply-style",
					id,
				},
			},
			"*"
		);
	}

	function removeStyle(id) {
		parent.postMessage(
			{
				pluginMessage: {
					type: "remove-style",
					id,
				},
			},
			"*"
		);
	}

	function renameStyle(id, name) {
		parent.postMessage(
			{
				pluginMessage: {
					type: "rename-style",
					id,
					name,
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
		// console.log(styles);
	}
</script>

<style>
	/* Add additional global or scoped styles here */
	:global(.bb) {
		border-bottom: 1px solid var(--grey);
	}
</style>

<svelte:window on:message={onLoad} />

<!-- <div class="bt" style="display: hidden" /> -->
<div class="wrapper p-xxsmall">
	<!-- <Label>Shape</Label>
	<SelectMenu bind:menuItems bind:value={selectedShape} class="mb-xxsmall" />

	<Label>Count</Label>
	<Input iconText="#" bind:value={count} class="mb-xxsmall" /> -->
	<div style="margin-left: -8px; margin-right: -8px;">
		{#each styles as style}
			<Type class="p-xsmall bb">
				{style.name}
				<a on:click={renameStyle(style.id, 'test')}>Rename</a>
				<a on:click={applyStyle(style.id)}>Apply</a>
				<a on:click={updateInstances(style.id)}>Resync</a>
				<a on:click={removeStyle(style.id)}>Remove</a>
			</Type>
		{/each}
	</div>

	<div class="flex p-xxsmall mb-xsmall">
		<!-- <Button on:click={cancel} variant="secondary" class="mr-xsmall">
			Cancel
		</Button> -->
		<!-- <Button on:click={createShapes} bind:disabled>Create shapes</Button> -->
		<Button on:click={addStyle}>Add style</Button>
	</div>
</div>

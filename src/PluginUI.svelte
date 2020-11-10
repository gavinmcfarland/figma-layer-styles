<script>
	//import Global CSS from the svelte boilerplate
	//contains Figma color vars, spacing vars, utility classes and more
	import { GlobalCSS } from "figma-plugin-ds-svelte";

	//import some Svelte Figma UI components
	import { Button, Input, Label, SelectMenu } from "figma-plugin-ds-svelte";

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

	function copyStyles() {
		parent.postMessage(
			{
				pluginMessage: {
					type: "copy-styles",
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
		console.log(styles);
	}
</script>

<style>
	/* Add additional global or scoped styles here */
</style>

<svelte:window on:message={onLoad} />
<div class="wrapper p-xxsmall">
	<Label>Shape</Label>
	<SelectMenu bind:menuItems bind:value={selectedShape} class="mb-xxsmall" />

	<Label>Count</Label>
	<Input iconText="#" bind:value={count} class="mb-xxsmall" />
	{#each styles as style}
		<div>{style.name}</div>
	{/each}

	<div class="flex p-xxsmall mb-xsmall">
		<Button on:click={cancel} variant="secondary" class="mr-xsmall">
			Cancel
		</Button>
		<!-- <Button on:click={createShapes} bind:disabled>Create shapes</Button> -->
		<Button on:click={copyStyles}>Copy styles</Button>
	</div>
</div>

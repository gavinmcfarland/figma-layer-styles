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

	let showRename = false;
	let styleBeingEdited = null;

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

	function editStyle(style) {
		showRename = true;
		styleBeingEdited = style;
	}

	function openMenu(event) {
		var menu = event.currentTarget.getElementsByClassName("menu");
		menu[0].classList.toggle("show");
	}

	function closeMenu(event) {
		var menu = event.currentTarget.getElementsByClassName("more");
		for (let i = 0; i < menu.length; i++) {
			menu[i].children[1].classList.remove("show");
		}
	}

	function onPageClick(e) {
		var menu = e.currentTarget.getElementsByClassName("more");

		for (let i = 0; i < menu.length; i++) {
			if (e.target === menu[i] || menu[i].contains(e.target)) {
				return;
			}
		}

		console.log("Clicked outside");
		closeMenu(e);
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
		position: relative;
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

	:global(.menu) {
		display: none;
		color: white;
		position: absolute;
		right: 8px;
		z-index: 100;
	}

	:global(.show) {
		display: block;
	}

	.menu {
		color: #fff;
		padding: 8px 0;
		z-index: 100;
		background: #222222;
		box-shadow: 0px 2px 7px rgba(0, 0, 0, 0.15),
			0px 5px 17px rgba(0, 0, 0, 0.2);
		border-radius: 2px;
	}

	.menu > a {
		line-height: 24px;
		padding-left: 16px;
		padding-right: 16px;
		position: relative;
		display: block;
	}

	.menu > a:hover {
		background-color: var(--blue);
		color: white;
	}

	.menu > .triangle {
		width: 12px;
		height: 12px;
		background-color: #222222;
		transform: rotate(45deg);
		position: absolute;
		top: -3px;
		right: 10px;
	}
</style>

<svelte:window on:message={onLoad} />

<!-- <div class="bt" style="display: hidden" /> -->
{#if !showRename}
	<div
		class="wrapper p-xxsmall"
		transition:fade={{ duration: 100 }}
		on:click={onPageClick}>
		<!-- <Label>Shape</Label>
	<SelectMenu bind:menuItems bind:value={selectedShape} class="mb-xxsmall" />

	<Label>Count</Label>
	<Input iconText="#" bind:value={count} class="mb-xxsmall" /> -->
		<div style="margin-left: -8px; margin-right: -8px;">
			{#each styles as style}
				<Type class="list-item pl-xsmall pr-xxsmall flex place-center">
					<span style="flex-grow: 1;">{style.name}</span>
					<IconButton
						on:click={updateInstances(style.id)}
						iconName={IconSwap} />
					<!-- <IconButton
					on:click={removeStyle(style.id)}
					iconName={IconMinus} /> -->
					<span
						on:click={openMenu}
						on:clickoutside={closeMenu}
						class="more">
						<IconButton iconName={IconEllipses} />
						<div class="menu">
							<div class="triangle" />
							<a on:click={applyStyle(style.id)}>Apply</a>
							<!-- <a on:click={renameStyle(style.id, 'test')}>Rename</a> -->
							<a on:click={editStyle(style)}>Rename</a>
							<a on:click={removeStyle(style.id)}>Delete</a>
						</div>
					</span>
				</Type>
			{/each}
		</div>

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
{:else}
	<div class="wrapper p-xxsmall" transition:fade={{ duration: 100 }}>
		<Label>Style Name</Label>
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
{/if}

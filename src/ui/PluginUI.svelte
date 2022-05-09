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

	import Styles from "./Styles.svelte";

	//this is a reactive variable that will return false when a value is selected from
	//the select menu, its value is bound to the primary buttons disabled prop
	// $: disabled = selectedShape === null;

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

	var styles = [];

	async function onLoad(event) {
		styles = await event.data.pluginMessage;
	}
</script>

<svelte:window on:message={onLoad}/>

<!-- <div class="bt" style="display: hidden" /> -->

<div class="wrapper p-xxsmall">
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
			iconName={IconPlus}
		/>
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

<style>
	/* Add additional global or scoped styles here */
	:global(input) {
		background-color: var(--figma-color-bg, white) !important;
		color: var(--figma-color-text, black) !important;
	}
	:global(body) {
		background-color: var(--figma-color-bg, white);
	}
	:global(svg) {
		fill: var(--figma-color-text, black) !important;
	}
	:global(.type) {
		color: var(--figma-color-text, black) !important;
	}
	:global(.bb) {
		border-bottom: 1px solid var(--figma-color-border, var(--grey));
	}
	:global(.bt) {
		border-top: 1px solid var(--figma-color-border, var(--grey));
	}
	:global(.place-center) {
		align-items: center;
	}
	:global(.list-item) {
		height: 32px;
	}

	.action-bar {
		position: fixed;
		bottom: 1px;
		border-radius: 2px;
		left: 0;
		width: 100%;
		place-content: flex-end;
		background-color: var(--figma-color-bg, white);
	}

	/* :gloabl(.action-bar > *) {
		margin-left: 8px;
	}

	:global(.action-bar > *:first-child) {
		margin-left: 0;
	} */

	.wrapper {
		height: calc(100% - 1px);
	}

	:global(body) {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}

	:global(body::-webkit-scrollbar) {
		display: none;
	}

	:global(.show) {
		display: block !important;
	}

	:global(.IconButton:hover) {
		background: var(--figma-color-bg-hover, var(--hover-fill)) !important;
	}
</style>

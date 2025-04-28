<script lang="ts">
	import { fade } from "svelte/transition";
	import Icon from "./lib/components/Icon.svelte";
	import Styles from "./Styles.svelte";

	function addStyle() {
		parent.postMessage(
			{
				pluginMessage: {
					type: "add-style",
				},
			},
			"*",
		);
	}

	var styles = $state([]);

	async function onLoad(event) {
		if (event.data.pluginMessage.type === "styles") {
			styles = event.data.pluginMessage.styles;
		}
	}
</script>

<svelte:window onmessage={onLoad} />

<div class="">
	<Styles {styles} />

	<div class="action-bar flex p-xxsmall bt">
		<Icon svg="plus" />
		<button onclick={addStyle}>Add style</button>
	</div>
</div>

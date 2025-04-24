<script lang="ts">
	import ListItem from "./ListItem.svelte";

	let { styles } = $props();
</script>

{#if styles}
	<div id="styles">
		{#each styles as style, i}
			<ListItem {style} />
		{/each}
	</div>
{/if}

<script lang="ts">
	import ListItem from './lib/components/ListItem.svelte'

	let { styles, currentSelection, selectedStyles = $bindable() } = $props()
</script>

{#if styles}
	<div id="styles">
		{#each styles as style, i}
			<ListItem {style} {styles} {currentSelection} {selectedStyles} key={i} />
		{/each}
	</div>
{/if}

<style>
	#styles {
		user-select: none;
	}
</style>

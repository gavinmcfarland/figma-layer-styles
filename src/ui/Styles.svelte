<script lang="ts">
	import ListItem from './lib/components/ListItem.svelte'
	import { selectedStyles } from './lib/stores'

	let { styles, currentSelection } = $props()
</script>

{#if styles}
	<div id="styles">
		{#each styles as style, i}
			<ListItem {style} {styles} {currentSelection} key={i} />
		{/each}
	</div>
{/if}

<style>
	#styles {
		user-select: none;
	}
</style>

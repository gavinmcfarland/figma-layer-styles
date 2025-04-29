<script lang="ts">
	import ListItem from './lib/components/ListItem.svelte'

	let { styles, currentSelection } = $props()
</script>

{#if styles}
	<div id="styles">
		{#each styles as style, i}
			<ListItem {style} {currentSelection} key={i} />
		{/each}
	</div>
{/if}

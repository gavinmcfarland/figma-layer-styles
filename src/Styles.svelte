<script>
    import ListItem from "./ListItem.svelte";

    export let styles;
</script>

{#if styles}
    <div
        id="styles"
        style="margin-left: -8px; margin-right: -8px; padding-bottom: 57px;"
    >
        {#each styles as style, i}
            <ListItem {style} />
        {/each}
    </div>
{/if}

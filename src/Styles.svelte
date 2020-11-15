<script>
    import ListItem from "./ListItem.svelte";

    export let styles;
</script>

<div
    style="margin-left: -8px; margin-right: -8px; margin-bottom: 57px; position: relative;">
    {#each styles as style, i}
        <ListItem {style} />
    {/each}
</div>

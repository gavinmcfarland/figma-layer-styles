<script>
    import ListItem from "./ListItem.svelte";

    export let styles;
</script>

<div style="margin-left: -8px; margin-right: -8px;">
    {#each styles as style (style.id)}
        <ListItem {style} />
    {/each}
</div>

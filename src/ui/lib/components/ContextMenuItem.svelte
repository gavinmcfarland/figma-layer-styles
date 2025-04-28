<script>
	let { onClick, children } = $props();
</script>

<span class="context-menu-item" onclick={onClick}>{@render children?.()}</span>

<style>
	.context-menu-item {
		line-height: 24px;
		padding-left: var(--spacer-2);
		padding-right: var(--spacer-2);
		position: relative;
		display: block;
		user-select: none;
	}

	.context-menu-item:hover {
		background-color: var(--figma-color-bg-brand);
	}
</style>

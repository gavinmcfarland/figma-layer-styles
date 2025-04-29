<script lang="ts">
	import { fade } from 'svelte/transition'
	import Styles from './Styles.svelte'
	import { IconButton } from '@figma-ui/mono-repo/library/packages/svelte'
	import '@figma-ui/mono-repo/library/packages/styles'

	function addStyle() {
		parent.postMessage(
			{
				pluginMessage: {
					type: 'add-style',
				},
			},
			'*',
		)
	}

	var styles = $state([])

	async function onLoad(event: MessageEvent) {
		if (event.data.pluginMessage.type === 'styles') {
			styles = event.data.pluginMessage.styles
		}
	}
</script>

<svelte:window onmessage={onLoad} />

<div class="">
	<div class="styles">
		<Styles {styles} />
	</div>

	<div class="action-bar">
		<div class="spacer"></div>
		<IconButton icon="plus" onClick={addStyle} />
	</div>
</div>

<style lang="ts">
	.action-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacer-2);
		border-top: 1px solid var(--figma-color-border);
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 50;
		height: 40px;
	}

	.styles {
		padding-block: var(--spacer-2);
	}

	.spacer {
		flex-grow: 1;
	}
</style>

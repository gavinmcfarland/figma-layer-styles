<script lang="ts">
	interface Props {
		svg: any;
		color?: string;
		opacity?: number;
		strokeWidth?: number;
		isAnimated?: boolean;
		size?: number;
	}

	let {
		svg,
		color = "currentColor",
		opacity = 0.8,
		strokeWidth = 1.5,
		isAnimated = false,
		size = 24,
	}: Props = $props();
	let sizePx = $derived(`${size}px`);
</script>

{#if svg === "plus"}
	<svg
		width={sizePx}
		height={sizePx}
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			fill-rule="evenodd"
			clip-rule="evenodd"
			d="M12 6C12.2761 6 12.5 6.22386 12.5 6.5V11.5H17.5C17.7761 11.5 18 11.7239 18 12C18 12.2761 17.7761 12.5 17.5 12.5H12.5V17.5C12.5 17.7761 12.2761 18 12 18C11.7239 18 11.5 17.7761 11.5 17.5V12.5H6.5C6.22386 12.5 6 12.2761 6 12C6 11.7239 6.22386 11.5 6.5 11.5H11.5V6.5C11.5 6.22386 11.7239 6 12 6Z"
			fill={color}
			fill-opacity={opacity}
		/>
	</svg>
{/if}

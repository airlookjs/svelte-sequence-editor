<!-- @component `BlockHandle` must be descendent of `SequenceBlock`. -->

<script lang="ts">

	import type { Block } from '../Block';
	import { getSequenceContext } from './SequenceContext';

	const { time } = getSequenceContext();

	export let type: 'inTime' | 'outTime';
	export let fixed = false; // TODO: fix type - or add another so we can also have a seperate icon for linked handles
	export let selected: 'inTime' | 'outTime' | 'block' | null = null;

	$: active = selected == type || selected == 'block';

	export let disabled = false;
	export let block: Block | undefined = undefined;

	$: absoluteTime = block ? (type == 'inTime') ? block.absoluteInTime : block.absoluteOutTime : undefined;

	/*
	{#if typeof fixed == 'number'}
	{:else}
	{/if}

	{#if selected == type}s
	{:else}	
	{/if}
*/
</script>

<button
	class="tl-handle tl-{type.toLowerCase()}"
	class:at-playhead={block && $time == absoluteTime}
	class:tl-active={active}
	style={disabled
		? 'cursor: not-allowed'
		: typeof fixed == 'number'
			? 'cursor: default'
			: 'cursor: ew-resize'}
	on:pointerdown
	on:mouseover
	on:focus
	on:mouseleave
/>

<style lang="postcss">
	.tl-handle {
		@apply w-4 overflow-hidden text-center h-full bg-gray-900 bg-opacity-20 dark:bg-white dark:bg-opacity-30 ;
	}

	.tl-handle:not(.tl-active):hover {
		@apply bg-opacity-60 dark:bg-opacity-60;
	}

	.tl-intime {
		@apply rounded-l-sm;
	}

	.tl-outtime {
		@apply rounded-r-sm;
	}

	.tl-active {
		@apply bg-black bg-opacity-70 dark:bg-white dark:bg-opacity-70;
	}


	.at-playhead {
		@apply border-red-800 dark:border-red-400;
	}
	.tl-intime.at-playhead {
		@apply border-l-2;
	}
	.tl-outtime.at-playhead {
		@apply border-r-2;
	}
</style>

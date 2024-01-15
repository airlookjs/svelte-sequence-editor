<script lang="ts">
	import type { Block } from '../Block';

	import { getSequenceContext } from './SequenceContext';

	export let time: number;
	export let index: number;

	export let disableSnapping = false;
	export let block: Block;

	export let tag = 'div';

	const { duration, width, scrubOverride, time: sequenceTime } = getSequenceContext();

	$: timeToPixel = (1 / $duration) * $width;
	$: absoluteTime = time + block.absoluteInTime;
</script>

<svelte:element this={tag} class="tl-block-marker-wrapper" style="left: {time * timeToPixel}px; top: 0;">	
	<!-- Render transparent interactive marker above block content (block handle)-->
	<div
		title="marker #{index} at {time}"
		class="tl-block-marker-interactive"
		on:pointerdown
		on:focus
		on:mouseover={() => {
			if (disableSnapping) return;
			scrubOverride.set(true);
			sequenceTime.set(absoluteTime);
		}}
		on:mouseleave={() => {
			if (disableSnapping) return;
			scrubOverride.set(false);
		}}
		role="note"
	>
		<!--<span class="text-xs z-5">{index + 1}</span>-->
	</div>

	<!-- Render graphic marker under block content-->
	<div title="marker at {time}" class="tl-block-marker-indicator">
		<div class="top">
		</div>
		<div class="flex-grow">
		</div>
		<div class="bottom">
		</div>
	</div>
</svelte:element>

<style lang="postcss">
	.tl-block-marker-wrapper {
		@apply absolute h-full;
	}

	.tl-block-marker-interactive {
		margin-left: -50%;
		@apply relative w-4 h-full flex items-center justify-center pointer-events-auto z-20 cursor-default;
	}

	.tl-block-marker-indicator {
		margin-left: -0.0625rem;
		width: 0.0625rem;
		bottom: 0.0625rem;
		top: 0.0625rem;
		@apply flex flex-col absolute pointer-events-none z-0 cursor-default;
	}

	.tl-block-marker-indicator .top, .tl-block-marker-indicator .bottom {
		@apply bg-gray-800 dark:bg-gray-100 bg-opacity-50 dark:bg-opacity-50 h-1;
	}
</style>

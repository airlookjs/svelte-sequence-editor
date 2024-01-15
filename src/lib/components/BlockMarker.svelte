<script lang="ts">

	import type { Block } from '../Block';
	import type { SequenceContext } from '../types';

	import { getContext } from 'svelte';
	import { key } from './key';

	export let time: number;
	export let index: number;

	export let disableSnapping = false;
	export let block: Block;

	const {
		duration,
		width,
		scrubOverride,
		time: sequenceTime,
	}: SequenceContext = getContext(key);

	$: timeToPixel = (1 / $duration) * $width;
	$: absoluteTime = time + block.absoluteInTime;

</script>

<div class="tl-block-marker-wrapper" style="left: {time * timeToPixel}px; top: 1px;">

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
<div
	title="marker at {time}"
	class="tl-block-marker-indicator">
</div>

</div>

<style lang="postcss">

.tl-block-marker-wrapper {
	@apply absolute h-full;
}

.tl-block-marker-interactive {
	margin-left: -50%;
	@apply relative w-4 h-full flex items-center justify-center pointer-events-auto z-20 cursor-default;
}

.tl-block-marker-indicator {
	margin-left: -1px;
	width: 1px;
	@apply absolute top-0 pointer-events-none z-0 bg-white opacity-50 h-full cursor-default;
}

</style>
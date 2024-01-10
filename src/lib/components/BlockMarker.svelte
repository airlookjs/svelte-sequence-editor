<script lang="ts">
	export let time: number;
	export let index: number;

	/*import { getContext } from 'svelte';
	import { key } from './key';
	import type { SequenceContext } from '$lib/types';*/

	//const { duration, width, selectedHandle, snapTimes }: SequenceContext = getContext(key);
</script>

<!-- Marker circle with label and formatted time in popover -->
<button
	title="marker at {time}"
	class="tl-block-marker relative bg-white rounded-full w-4 h-4 flex items-center justify-center"
	on:pointerdown
	on:mouseover
	on:focus
	on:mouseleave
>
	<span class="text-xs">{index + 1}</span>
</button>

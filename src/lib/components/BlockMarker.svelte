<script lang="ts">
	export let time: number;
	export let index: number;

	/*import { getContext } from 'svelte';
	import { key } from './key';
	import type { SequenceContext } from '$lib/types';*/

	//const { duration, width, selectedHandle, snapTimes }: SequenceContext = getContext(key);

	// bg-white bg-opacity-50 <- insert for outer div to visualize interactive area
</script>

<!-- Marker circle with label and formatted time in popover -->


<!-- Render transparent interactive marker above block content (block handle)-->

<div
	title="marker #{index} at {time}"
	style='cursor: default; margin-left: -50%;'
	class="peer tl-block-marker relative w-4 h-full flex items-center justify-center pointer-events-auto z-20"
	on:pointerdown
	on:mouseover
	on:focus
	on:mouseleave
	role="note"
>	
	<!--<span class="text-xs z-5">{index + 1}</span>-->
</div>


<!-- Render graphic marker under block content-->
<div
	title="marker at {time}"
	style='cursor: default; margin-left: -1px; width: 1px;'
	class="tl-block-marker absolute top-0 flex items-center justify-center pointer-events-none z-0 bg-white peer-hover:opacity-60 peer-hover:bg-black opacity-50 h-full w-1 "
	>

</div>

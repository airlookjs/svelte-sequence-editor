<script lang="ts">
	import Layer from '../components/Layer.svelte';
	import Timebar from '../components/Timebar.svelte';
	import type { TimelineContext, TSelectedHandle } from '../types';
	import { key } from '../components/key';
	import { writable } from 'svelte/store';
	import { uniqueClasses } from '../utils';
	import { setContext } from 'svelte';
	import type { createTimeline } from '$lib/createTimeline';

	export let timeline: ReturnType<typeof createTimeline>;
	export let currentTime: null | number = null;

	const timelineData = timeline.timeline;
	const duration = timeline.duration;

	let currentWidth: null | number = null;

	const time = writable(currentTime ?? -1);
	const width = writable(currentWidth ?? 30000);

	const selectedHandle: TSelectedHandle = writable(null);
	const scrubOverride = writable(false);
	const disabled = writable(false);

	const context: TimelineContext = {
		time,
		duration,
		timeline: timelineData,
		width,
		selectedHandle,
		scrubOverride,
		setTime: (_value) => time.set(_value),
	};

	setContext(key, context);

	$: currentTime = $time;
	let containerClasses = 'tl-timeline-container';

	let className = '';
	export { className as class };

	export let tag = 'div';

	let timelineEl: HTMLElement | null;

	const handleTimelinePointerMove = (e: PointerEvent) => {
		if ($selectedHandle || $scrubOverride) {
		} else {
			const x = e.clientX - (timelineEl?.offsetLeft ?? 0);
			time.set(Math.min(Math.max((x / $width) * $duration, 0), $duration));
		}
	};

	const handleTimelinePointerUp = (e: PointerEvent) => {
		const x = e.clientX - (timelineEl?.offsetLeft ?? 0);
		//time.set(Math.min(Math.max((x / $width) * $duration, 0), $duration));
		selectedHandle.set(null);
	};

	const getGridBackground = (duration: number, millis = 2000, lineWidth = 0.5, color = '#9993') => {
		const divisions = duration / millis;
		const divisionsPercent = 100 / divisions;
		return `background-image: 
			linear-gradient(90deg, ${color} ${lineWidth}px, transparent ${lineWidth}px, transparent calc(100% - ${lineWidth}px), ${color} calc(100% - ${lineWidth}px));
			background-size: ${divisionsPercent}% 100%;`;
	};

	$: gridBackground = getGridBackground($duration);


</script>

<!-- Could likely be implemented more elegantly pending popular feature request in svelte, but it works like this -->
<svelte:head>
	<svelte:element this="style">
		:root {'{'}
		{#if $selectedHandle?.cursor}
			cursor: {$selectedHandle.cursor};
		{/if}
		{'}'}
	</svelte:element>
</svelte:head>

<svelte:window on:pointerup={handleTimelinePointerUp} />

<svelte:element
	this={tag}
	bind:this={timelineEl}
	bind:clientWidth={$width}
	on:pointermove={handleTimelinePointerMove}
	class={uniqueClasses(`${containerClasses}${className ? ` ${className}` : ''}`)}
	style={gridBackground}
	{...$$restProps}
>
	<slot {currentTime} setTime={context.setTime} layers={$timelineData.layers}>
		<Timebar />

		{#if $timelineData.layers}
			{#each $timelineData.layers as layer (layer.key)}
				<Layer disabled={$disabled} data={layer} />
			{/each}
		{/if}
	</slot>
</svelte:element>

<style lang="postcss">
	.tl-timeline-container {
		@apply select-none pb-6 border rounded-md overflow-hidden relative;
	}
</style>

<script lang="ts">
	import { getContext } from 'svelte';
	import type { SequenceContext } from '../types';
	import { key } from './key';
	import { uniqueClasses } from '../utils';

	import TimebarLabel from './TimebarLabel.svelte';

	const { time, duration, scrubOverride, selectedHandle }: SequenceContext = getContext(key);

	export let formatTimeFn = (value: number) => `${Math.round(value)}`;

	// We could instead have a store for timebarLabels that we loop over to allow showing n number of relevant times and control through context
	let extraTime: number | null = null;

	$: {
		if ($selectedHandle) {
			if ($selectedHandle.handle == 'block') {
				extraTime = $selectedHandle.block.absoluteOutTime;
			} else {
				extraTime = null;
			}
		} else {
			extraTime = null;
		}
	}

	$: durationString = formatTimeFn($duration);
	$: startTimeString = formatTimeFn(0);

	let className = '';
	export { className as class };

	export let tag = 'div';
	let containerClasses = 'tl-timebar-container';
</script>

<svelte:element
	this={tag}
	class={uniqueClasses(`${containerClasses}${className ? ` ${className}` : ''}`)}
	{...$$restProps}
>
	<slot>
		<div class="tl-timebar {$scrubOverride ? 'scrub-active' : ''}">
			<div class="tl-timebar-left"><em class="tl-start">{startTimeString}</em></div>
			<div class="tl-timebar-center">
				<TimebarLabel time={$time} formatFn={formatTimeFn} />
				{#if extraTime}
					<TimebarLabel time={extraTime} formatFn={formatTimeFn} />
				{/if}
			</div>
			<div class="tl-timebar-right">
				<em class="tl-duration">{durationString}</em>
			</div>
		</div>
	</slot>
</svelte:element>

<!-- @component `Timebar` must be descendent of `Sequence`. -->
<style lang="postcss">
	.tl-timebar-container {
	}
	.tl-timebar {
		@apply flex bg-gray-100 bg-opacity-50 rounded-md shadow-inner py-1;
	}
	.tl-timebar-left {
		@apply flex-none;
	}
	.tl-timebar-center {
		@apply flex-1 invisible;
	}
	.tl-timebar-right {
		@apply flex-none text-right;
	}

	.tl-playhead-time {
		@apply absolute font-bold;
	}

	.tl-playhead-blockend {
		@apply absolute font-bold;
	}

	.tl-start {
		@apply pl-2 not-italic font-mono;
	}

	.tl-duration {
		@apply pr-2 not-italic font-mono;
	}
	:global(.tl-sequence-container:hover) .tl-timebar-center,
	.scrub-active .tl-timebar-center {
		@apply visible;
	}
	:global(.tl-sequence-container:hover) .tl-start,
	:global(.tl-sequence-container:hover) .tl-duration,
	.scrub-active .tl-start,
	.scrub-active .tl-duration {
		@apply invisible;
	}
</style>

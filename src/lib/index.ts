export { default as Timeline } from './components/Timeline.svelte';
export { default as Layer } from './components/Layer.svelte';
export { default as Timebar } from './components/Timebar.svelte';
export { default as Block } from './components/Block.svelte';
export { default as BlockHandle } from './components/BlockHandle.svelte';
export { createTimeline, deepFlat } from './createTimeline';

export { TimelineBlock } from './TimelineBlock';
export { TimelineLayer } from './TimelineLayer';

export type { TTimelineOptions, TTimelineLayerOptions, ITimelineCommonOptions } from './types';

import type { Sequence } from '$lib/Sequence';
import type { TSelectedHandle } from '$lib/types';
import type { Writable } from 'svelte/store';

import { getContext, setContext } from 'svelte';

export type SequenceContext = {
	time: Writable<number>;
	width: Writable<number>;
	duration: Writable<number>;
	selectedHandle: TSelectedHandle;
	snapTimes: Writable<number[]>;
	scrubOverride: Writable<boolean>;
	sequence: Writable<Sequence>;
};

export const key = Symbol();

export const setSequenceContext = (context: SequenceContext) => {
	return setContext<SequenceContext>(key, context);
};

export const getSequenceContext = () => {
	return getContext<SequenceContext>(key);
};

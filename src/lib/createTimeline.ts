import { writable, derived, type Updater, type Writable } from 'svelte/store';
import { TimelineLayer } from './TimelineLayer';
import type { TTimelineLayerOptions, TTimelineOptions, TTimelineChild } from './types';
import { Timeline } from './Timeline';
import type { TimelineBlock } from './TimelineBlock';

const DEFAULT_DURATION = 30000;
const DEFAULT_OPTIONS: Required<TTimelineOptions> = {
	validations: {
		inTime: {},
		outTime: {},
		duration: {
			min: 3000
		}
	},
	roundingBase: () => {
		return 1;
	}
};

export const deepFlat = (data: TTimelineChild[]) => {
	return data.reduce<TTimelineChild[]>((acc, item) => {
		acc.push(item);
		const children = item instanceof TimelineLayer ? item.blocks : item.layers;
		if (children && children.length > 0) {
			acc = acc.concat(deepFlat(children));
		}
		return acc;
	}, []);
};

export const createTimeline = ({
	initialData,
	duration,
	options
}: {
	initialData: TTimelineLayerOptions[];
	duration?: number; // | Writable<number>
	options?: TTimelineOptions;
}) => {
	options = {
		...DEFAULT_OPTIONS,
		...options
	};

	duration = duration ?? DEFAULT_DURATION;

	const optionsStore = writable(options);
	const durationStore = writable(duration);

	const timeline = new Timeline(initialData, duration, options);
	timeline.initialize(); // control when its called?

	const timelineStore = writable(timeline);

	durationStore.subscribe((value) => {
		timeline.setDuration(value);
		durationStore.set(timeline.getDuration());
		timelineStore.set(timeline);
	});

	const flatKeyStore = derived(timelineStore, ($store) => {
		const flat = deepFlat($store.layers);
		const map = new Map<string, TTimelineChild>();

		flat.map((item: TTimelineChild) => {
			map.set(item.getAbsoluteKey(), item);
		});

		return map;
	});

	const getStore = <T extends TTimelineChild>(key: string) => {
		const c = timeline.getByKey(key) as T;
		if (!c) {
			//console.warn('no child found for key in timeline', key);
			return;
		}
		const store: Writable<T> = writable(c);

		const set = (value: T) => {
			store.set(value);
			timelineStore.set(timeline);
		};

		const update = (updater: Updater<T>) => {
			store.update(updater);
			timelineStore.set(timeline);
		};

		const unsubscribe = flatKeyStore.subscribe((value) => {
			const change = value.get(key) as T;
			if (change) {
				//console.log('flatKeyStore change', key, change);
				store.set(change);
			} else {
				unsubscribe();
			}
		});

		return {
			subscribe: store.subscribe,
			update: update,
			set
		};
	};

	return {
		getBlockStore: getStore as typeof getStore<TimelineBlock>,
		getLayerStore: getStore as typeof getStore<TimelineLayer>,
		flatKeys: flatKeyStore,
		options: optionsStore,
		duration: durationStore,
		//errors: errorStore,
		timeline: timelineStore
	};
};

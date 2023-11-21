import type { Writable } from 'svelte/store';
import { Timeline } from './Timeline';
import { TimelineLayer } from './TimelineLayer';
import { TimelineBlock } from './TimelineBlock';

type TimelineBlockHandleType = 'inTime' | 'outTime' | 'block'; // TODO: enum

export type TimelineValidationOption = {
	min?: number | { ref: string };
	max?: number | { ref: string };
	fixed?: number | { ref: string };
};

export type TimelineValidationOptions = {
	duration?: TimelineValidationOption;
	inTime?: TimelineValidationOption;
	outTime?: TimelineValidationOption;
};

export type TTimelineOptions = {
	validations?: TimelineValidationOptions;
	roundingBase: () => number;
	errorHandler?: (error: { type: string; message: string }) => void;
};

export interface ITimelineCommonOptions {
	key: string;
	title?: string;
	data?: {
		// any additional data
		[key: string]: unknown;
	};
}

export type TTimelineLayerOptions = ITimelineCommonOptions & {
	blocks: Array<TTimelineBlockOptions>;
	sortIndex?: number;
};

export type TTimelineBlockOptions = ITimelineCommonOptions & {
	key: string;
	id?: number;
	layer?: number;
	title?: string;
	inTime?: number; // Initial inTime absolute as absolute milliseconds
	outTime?: number; // Initial outTime as absolute milliseconds
	validations?: TimelineValidationOptions;
	layers?: Array<TTimelineLayerOptions>;
};

export interface ITimelineCommon {
	initialize(): void;
	scale(scaleFactor: number): void;
	update(): void;
	validate(): void; // maybe return errors ?
	getTimeline(): Timeline;
	getByKey(absoluteKey: string): ITimelineChild | null;

	errors: { type: string; message: string }[];
	layers?: TimelineLayer[];
	blocks?: TimelineBlock[];

	data?: {
		[key: string]: unknown;
	};

	getMaxDuration?(): number;
}
export interface ITimelineChild extends ITimelineCommon {
	parent: ITimelineCommon;
	getAbsoluteKey(): string;
}

export type TTimelineChild = TimelineLayer | TimelineBlock;

export type TTimelineData = TimelineLayer[];

export type TSelectedHandle = Writable<null | {
	//layer: undefined | number;
	block: TimelineBlock;
	cursor: string;
	handle: TimelineBlockHandleType;
}>;

export interface TimelineContext {
	time: Writable<number>;
	width: Writable<number>;
	duration: Writable<number>;
	selectedHandle: TSelectedHandle;
	scrubOverride: Writable<boolean>;
	timeline: Writable<Timeline>;
	setTime: (value: number) => void;
}

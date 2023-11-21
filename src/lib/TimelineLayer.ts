import { TimelineBlock } from './TimelineBlock';
import { Timeline } from './Timeline';
import type { ITimelineChild, TTimelineLayerOptions, TTimelineBlockOptions } from './types';

export class TimelineLayer implements ITimelineChild {
	parent: TimelineBlock | Timeline;
	sortIndex: number;
	blocks: TimelineBlock[] = [];
	key: string;
	//duration?: number;
	title?: string;
	data?: {
		[key: string]: unknown;
	};

	errors: string[] = [];

	constructor(options: TTimelineLayerOptions, parent: TimelineBlock | Timeline) {
		this.parent = parent;
		this.sortIndex = options.sortIndex ?? -1;
		this.key = options.key ?? `layer-${crypto.randomUUID()}`;
		this.data = options.data;

		//console.log('TimelineLayer constructor', options, index);

		this.blocks =
			options.blocks?.map((block, blockIndex) => {
				if (blockIndex > 0) {
					if (!block.inTime) {
						block.inTime = options.blocks[blockIndex - 1].outTime;
					}
				}
				return new TimelineBlock(block, blockIndex, this);
			}) || [];
	}

	public addBlock(blockOptions: TTimelineBlockOptions, insertAtIndex?: number) {
		const block = new TimelineBlock(blockOptions, insertAtIndex ?? this.blocks.length, this);

		if (insertAtIndex !== undefined) {
			this.blocks.splice(insertAtIndex, 0, block);

			// Reindex
			this.blocks = this.blocks.map((_block, index) => {
				_block.index = index;
				return _block;
			});
		} else {
			this.blocks.push(block);
		}

		block.initialize();
		return block;
	}

	public removeBlock(key: string) {
		//console.log('removeBlock', key);

		let found = false;
		this.blocks = this.blocks
			.map((block, index) => {
				if (block.getAbsoluteKey() === key) {
					found = true;
					return null;
				}
				if (found) {
					block.index = index - 1;
				}
				return block;
			})
			.filter(Boolean) as TimelineBlock[];

		//console.log('removed block, now have blocks', this.blocks);

		return this;
	}

	public getAbsoluteKey(): string {
		if (this.parent instanceof Timeline) {
			return this.key;
		}
		return `${this.parent.getAbsoluteKey()}.${this.key}`;
	}

	public update() {
		this.blocks.map((block) => {
			block.update();
		});
	}

	public scale(scaleFactor: number) {
		this.blocks.map((block) => {
			block.scale(scaleFactor);
		});
	}

	public initialize() {
		this.blocks.map((block) => {
			block.initialize();
		});
	}

	public getAbsoluteInTime(): number {
		if (this.parent instanceof TimelineBlock) {
			return this.parent.absoluteInTime;
		}
		return 0;
	}

	public getAbsoluteOutTime(): number {
		if (this.parent instanceof Timeline) {
			return this.parent.duration;
		}

		// If its not the root timeline its always a block
		return this.parent.absoluteOutTime;
	}

	public getInTime(): number {
		if (this.parent instanceof TimelineBlock) {
			return this.parent.inTime;
		}
		return 0;
	}

	public getOutTime(): number {
		if (this.parent instanceof Timeline) {
			return this.parent.duration;
		}

		// If its not the root timeline its always a block
		return this.parent.outTime;
	}

	public getDuration() {
		return this.getOutTime() - this.getInTime();
	}

	public getMinDuration() {
		return this.blocks.reduce((acc, b) => {
			return acc + b.getMinDuration();
		}, 0);
	}

	public getTimeline(): Timeline {
		return this.parent.getTimeline();
	}

	public validate() {
		return this.blocks.map((block) => {
			return block.validate();
		});
	}

	public getByKey(absKey: string): ITimelineChild | null {
		const parts = absKey.split('.');
		const block = this.blocks.find((block) => block.key === parts[0]);
		if (block) {
			if (parts.length === 1) {
				return block;
			}
			return block.getByKey(parts.slice(1).join('.'));
		}
		return null;
	}
}

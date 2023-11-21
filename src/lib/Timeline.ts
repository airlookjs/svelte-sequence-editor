import { TimelineLayer } from './TimelineLayer';
import type {
	ITimelineCommon,
	TTimelineOptions,
	TTimelineLayerOptions,
	ITimelineChild
} from './types';

export class Timeline implements ITimelineCommon {
	duration: number;
	layers: TimelineLayer[];
	options: TTimelineOptions;

	constructor(layers: TTimelineLayerOptions[], duration: number, options: TTimelineOptions) {
		this.duration = duration;
		this.options = options;
		//console.debug('Timeline constructor', layers, duration, options);

		this.layers = layers.map((layer) => {
			return new TimelineLayer(layer, this);
		});
	}

	public addLayer(layer: TTimelineLayerOptions) {
		this.layers.push(new TimelineLayer(layer, this));
	}

	public getDuration() {
		return this.duration;
	}

	public errorHandler(error: { type: string; message: string }) {
		if (this.options.errorHandler) {
			this.options.errorHandler(error);
		} else {
			console.error(error);
		}
	}

	public setDuration(duration: number, { scaleOnIncrease = false } = {}) {
		const scaleFactor = duration / this.duration;
		//const previousDuration = this.duration;
		//const durationDiff = duration - this.duration;

		if (duration < this.getMinDuration()) {
			if (this.options.errorHandler) {
				this.options.errorHandler({
					type: 'duration',
					message: `Duration can not be set below ${this.getMinDuration()}. Try to remove some elements.`
				});
			}

			duration = this.getMinDuration();
		}

		if (scaleFactor < 1) {
			this.layers.forEach((layer) => {
				const lastBlock = layer.blocks[layer.blocks.length - 1];
				if (lastBlock.outTime > duration) {
					const diff = lastBlock.outTime - duration;
					lastBlock.move(-diff);
				}
			});

			//this.scale(scaleFactor);
		} else {
			if (scaleOnIncrease) {
				this.scale(scaleFactor);
			}
		}
		this.duration = duration;
		this.update();
		return duration;
	}

	public scale(scaleFactor: number) {
		this.layers.forEach((layer) => {
			layer.scale(scaleFactor);
		});
	}

	public getMinDuration() {
		const ret = [0];
		const layerMinDurations = this.layers?.map((layer) => layer.getMinDuration());
		/*if (typeof this.validations?.duration?.min == 'number') {
			ret.push(this.validations.duration.min);
		}*/
		return Math.max(...ret, ...layerMinDurations);
	}

	public update() {
		this.layers.forEach((layer) => {
			layer.update();
		});
	}

	public initialize() {
		this.layers.forEach((layer) => {
			layer.initialize();
		});
	}

	public getTimeline() {
		return this;
	}

	public validate() {
		return this.layers.map((layer) => {
			return layer.validate();
		});
	}

	public getByKey(absKey: string): ITimelineChild | null {
		const parts = absKey.split('.');
		const layer = this.layers.find((layer) => layer.key === parts[0]);
		if (layer) {
			if (parts.length === 1) return layer;
			return layer.getByKey(parts.slice(1).join('.'));
		}
		return null;
	}

	/*public getBlock(absKey: string) {
		const parts = absKey.split('.');
		const layer = this.layers.find((layer) => layer.key === parts[0]);
		if (layer) {
			return layer.getBlock(parts.slice(1).join('.'));
		}
	}*/
}

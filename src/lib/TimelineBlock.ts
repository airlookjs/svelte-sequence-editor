import type { TimelineValidationOptions, TTimelineBlockOptions } from './types';
import { TimelineLayer } from './TimelineLayer';
import type { ITimelineChild } from './types';
import { getUniqueKey } from './utils';

// TODO: get rid of string references to inTime and outTime use enum or similar instead
enum tHandles {
	inTime = 'inTime',
	outTime = 'outTime'
}

const DEFAULT_VALIDATION_OPTIONS: Required<TimelineValidationOptions> = {
	[tHandles.inTime]: {},
	[tHandles.outTime]: {},
	duration: {
		min: 1000
	}
};

export class TimelineBlock implements ITimelineChild {
	layers: TimelineLayer[];
	index: number;
	parent: TimelineLayer;
	key: string;
	title?: string;
	data?: {
		[key: string]: unknown;
	};

	errors: string[] = [];

	private _inTime?: number;
	private _outTime?: number;

	private initialValues: {
		inTime?: number;
		outTime?: number;
	};

	validations: TimelineValidationOptions;

	constructor(options: TTimelineBlockOptions, index: number, parent: TimelineLayer) {
		this.index = index;
		//this.inTime = options.inTime || 0;
		//this.outTime = options.outTime || 0;

		this.parent = parent;
		this.key = getUniqueKey(options.key, index+1, parent.blocks.map((block) => block.key));

		this.data = options.data;

		this.title = options.title || `${options.key}`;

		this.validations = {
			...DEFAULT_VALIDATION_OPTIONS,
			...parent.getTimeline().options.validations,
			...options.validations
		};

		// Initial values are absolute from root timeline
		this.initialValues = {
			inTime: options.inTime,
			outTime: options.outTime
		};

		// Add sub layers
		this.layers =
			options.layers?.map((layer) => {
				return new TimelineLayer(layer, this);
			}) || [];
	}

	public initialize() {
		if (this.initialValues.inTime != null) {
			this._inTime = this.initialValues.inTime;
		}

		if (this.initialValues.outTime != null) {
			this._outTime = this.initialValues.outTime;
		}

		if (this._inTime == null) {
			this._inTime = (this.parent.getDuration() / this.parent.blocks.length) * this.index;
		}

		//const evenDuration = this.parent.getDuration() / this.parent.blocks.length;

		if (this._outTime == null) {
			this._outTime = this._inTime + this.getMinDuration();
			/*Math.min(
				this._inTime + this.getMaxDuration(),
				Math.max(this._inTime + this.getMinDuration(), evenDuration)
			);*/
		}

		// initialize sub layers and blocks
		this.layers.forEach((layer) => {
			layer.initialize();
		});

		this.set();
	}

	public update() {
		this.set();
		this.layers.forEach((layer) => {
			layer.update();
		});
	}

	/**
	 * Used to scale timeline blocks when the parent duration changes
	 * @param factor
	 */
	public scale(scaleFactor: number) {
		this.layers.forEach((layer) => {
			layer.scale(scaleFactor);
		});
		this.setInTime(this.inTime * scaleFactor);
		this.setOutTime(this.outTime * scaleFactor);
	}

	public get inTime() {
		return this._inTime as number;
	}

	public set inTime(value: number) {
		this.setInTime(value);
	}

	public set absoluteInTime(value: number) {
		this.setInTime(value - this.parent.getAbsoluteInTime());
	}

	public get absoluteInTime() {
		return this.parent.getAbsoluteInTime() + this.inTime;
	}

	public get outTime() {
		return this._outTime as number;
	}

	public set outTime(value: number) {
		this.setOutTime(value);
	}

	public get absoluteOutTime() {
		return this.parent.getAbsoluteInTime() + this.outTime;
	}

	public set absoluteOutTime(value: number) {
		this.setOutTime(value - this.parent.getAbsoluteInTime());
	}

	public getDuration(): number {
		return this.outTime - this.inTime;
	}

	public getMaxDuration(): number {
		if (typeof this.validations?.duration?.fixed == 'number') {
			return this.validations.duration.fixed;
		}

		if (typeof this.validations?.duration?.max == 'number') {
			return Math.min(this.validations.duration.max, this.parent.getDuration());
		}
		return this.parent.getDuration();
	}

	// TODO: cache values to increase performance
	public getMinDuration(): number {
		if (typeof this.validations?.duration?.fixed == 'number') {
			return this.validations.duration.fixed;
		}

		const ret = [0];
		const layerMinDurations = this.layers?.map((layer) => layer.getMinDuration());

		if (typeof this.validations?.duration?.min == 'number') {
			ret.push(this.validations.duration.min);
		}

		return Math.max(...ret, ...layerMinDurations);
	}

	public set() {
		this.setInTime(this._inTime as number);
		this.setOutTime(this._outTime as number);
	}

	public setInTime(value: number, options: { maintainDuration?: boolean; snap?: boolean } = {}) {
		const res = this.setTimeCommon(value, tHandles.inTime, options);
		return res.apply();
	}

	public setOutTime(value: number, options: { maintainDuration?: boolean; snap?: boolean } = {}) {
		const res = this.setTimeCommon(value, tHandles.outTime, options);
		return res.apply();
	}

	public getAbsoluteKey() {
		return `${this.parent.getAbsoluteKey()}.${this.key}`;
	}

	public roundTime(time: number) {
		const base = this.getTimeline().options.roundingBase();
		return Math.round(time / base) * base;
	}

	// TODO: define prop string type specifically
	protected setTimeCommon(
		inputValue: number,
		prop: tHandles,
		options: { maintainDuration?: boolean; snap?: boolean },
		depth = 0
	) {
		depth++;

		const value = this.roundTime(inputValue);
		const propValidation = this.validations[prop];

		if (depth > 100) {
			// TODO: global max recursive depth setting
			throw new Error('Max recursion depth reached for timeline validation');
		}

		//const debugPrefix = `sTc ${this.getAbsoluteKey()}.${prop}:${value} depth:${depth}`;

		// Shorthands
		const isIn = prop == tHandles.inTime;
		const opProp = isIn ? tHandles.outTime : tHandles.inTime;
		const c = this[prop];
		const opC = this[opProp];

		const set = (_t: number) => {
			const applyFn = () => {
				//console.debug(debugPrefix, 'apply', _t);
				this[`_${prop}`] = _t;
				return {
					c: c,
					moved: _t - c,
					v0: value,
					v1: _t,
					blocked: value != _t
				};
			};

			return {
				c: c,
				moved: c != _t,
				v0: value,
				v1: _t,
				blocked: value != _t,
				apply: applyFn
			};
		};

		const setOp = (_t: number, _options = {}) => {
			//console.debug(debugPrefix, 'set opposing handle to', _t);
			return this.setTimeCommon(_t, opProp, { ...options, ..._options }, depth);
		};

		// Constrain value to 0 and parent duration
		// should it return false instead?
		// FIXME: $duration
		let setT = Math.min(this.parent?.getDuration() ?? /*$duration*/ 3000, Math.max(value, 0));

		if (isIn) {
			// Constrain inTime for min duration
			setT = Math.min(setT, this.parent?.getDuration() - this.getMinDuration());
		} else {
			// Constrain outTime for min duration
			setT = Math.max(setT, this.getMinDuration());
		}

		if (typeof propValidation?.fixed == 'number') {
			setT = propValidation.fixed;
		}

		const diff = setT - c;
		const fwd = setT > c ? true : false;
		//const fwdMult = fwd ? 1 : -1;
		const opMult = isIn ? -1 : 1;
		const dur = this.outTime - this.inTime;
		const tDur = (setT - opC) * opMult;

		const expanding = (fwd && prop == 'outTime') || (!fwd && prop == 'inTime');

		if (options?.maintainDuration) {
			//console.debug(debugPrefix, 'set opposing to maintain duration');
			const res = setOp(opC + diff, { maintainDuration: false });

			res.apply();
			if (res.blocked) {
				// When moving a block (maintainDuration: true) stop if the opposing handle is blocked
				//console.debug(debugPrefix, 'opposing handle hit a boundary');
				setT = res.v1 + dur * opMult;
			}
		}

		if (expanding) {
			// check against max duration when decreasing inTime or increasing outTime
			if (tDur > this.getMaxDuration()) {
				//console.debug(tDur, this.getMaxDuration(), opC, setT);
				//console.debug(debugPrefix, 'duration too long');

				this[`_${prop}`] = setT; // set op needs the current handle to be already updated to avoid looping on fixed durations
				const res = setOp(setT - this.getMaxDuration() * opMult, { maintainDuration: false });
				if (res.blocked) {
					// reset handle if blocked
					this[`_${prop}`] = c;
				} else {
					res.apply();
				}
				//setT = res.v1 + this.getMaxDuration() * opMult;
			}

			// if not first or last get adjacent block
			// attempt to set adjacent handles if blocking
			//if (this.index > 0 && this.index < this.parent.blocks.length - 1) {
			const adj = isIn ? this.getPreviousBlock() : this.getNextBlock();

			if (adj) {
				if ((isIn && setT < adj[opProp]) || (!isIn && setT > adj[opProp])) {
					//console.debug(debugPrefix, 'hits adjacent block');

					if (options.snap) {
						setT = adj[opProp];
					} else {
						const res = adj.setTimeCommon(
							setT,
							opProp,
							{ maintainDuration: options.maintainDuration },
							depth
						);
						res.apply();
						setT = res.v1;
					}
				}
			} else {
				//console.debug(debugPrefix, 'no adjacent block')
				/*if(!isIn && setT > this.parent.getOutTime()) {
                        console.debug(debugPrefix, 'hits parent outTime');
                        const res = this.parent.parent.setTimeCommon(setT, 'outTime', options, depth);
                        res.apply();
                        setT = res.v1;
                    }*/
			}
			//} else {

			/*console.log("exapnding and not first or last in layer")
				// if first or last and we have a parent layer check if we hit boundaries of the parent
                if (this.parent) {
                    const parent = this.parent;
                    if(!isIn) {
                        console.log(parent.getOutTime())
                        if(setT > parent.getOutTime()) {
                            console.debug(debugPrefix, 'hits parent outTime');
                            //const res = parent.setTimeCommon(setT, 'outTime', options, depth);
                            //res.apply();
                            //setT = res.v1;
                        }
                    }
                }*/

			//}
		} else {
			// check against min duration when increasing inTime or decreasing outTime
			if (tDur < this.getMinDuration()) {
				//console.debug(debugPrefix, 'duration too short');
				const res = setOp(setT - this.getMinDuration() * opMult);
				//console.debug('after setOp too short');
				/*if(res.blocked) {
                console.debug(debugPrefix, "opposing handle blocked in maintaining min duration");
            } */

				res.apply();
				setT = res.v1 + this.getMinDuration() * opMult;
			}

			// if the block has sub layers, validate recusively if their blocks fit - if the duration has changed
			/*if(this.layers.length > 0) {
            const childRes = this.layers.map((layer) => {
                if(layer.blocks.length > 0) {
                    layer.blocks.length.map((childBlock) => {
                        childBlock.
                    })
                }
            });
        }*/

			// recursive validation for child layers
			if (this.layers.length > 0) {
				this.layers.map((layer) => {
					if (layer.blocks.length > 0) {
						//
						const lastChild = layer.blocks[layer.blocks.length - 1];

						if (!isIn && setT - this.inTime < lastChild.outTime && !options.maintainDuration) {
							const res = lastChild.setTimeCommon(
								setT - this.inTime,
								tHandles.outTime,
								options,
								depth
							);
							res.apply();
							setT = this.inTime + res.v1;

							return res;
						} else if (isIn && !options.maintainDuration) {
							if (this.outTime - setT < lastChild.outTime) {
								const res = lastChild.setTimeCommon(
									this.outTime - setT,
									tHandles.outTime,
									options,
									depth
								);
								res.apply();
								setT = setT - (res.v1 - res.v0);
								return res;
							}
						}
					}
				});
			}
		}

		return set(setT);
	}

	public move(delta: number, options: { snap?: boolean } = {}) {
		if (delta == 0) return;

		const res = this.setTimeCommon(
			(delta > 0 ? this.inTime : this.outTime) + delta,
			delta > 0 ? tHandles.inTime : tHandles.outTime,
			{ maintainDuration: true, snap: options.snap }
		);
		return res.apply();
	}

	public validate() {
		const errors = [];
		if (this.inTime > this.outTime) {
			errors.push('inTime can not be above outTime');
		}
		if (this.inTime < 0) {
			errors.push('inTime can not be below 0');
		}
		if (this.outTime > this.parent.getOutTime()) {
			errors.push('outTime can not be above parent outTime');
		}
		if (this.getDuration() < this.getMinDuration()) {
			errors.push('duration can not be below minDuration');
		}
		if (this.getDuration() > this.getMaxDuration()) {
			errors.push('duration can not be above maxDuration');
		}

		this.layers.forEach((layer) => {
			layer.validate();
		});

		this.errors = errors;
		return errors;
	}

	public getPreviousBlock() {
		if (this.index < 1) return null;
		return this.parent.blocks[this.index - 1];
	}

	public getNextBlock() {
		if (this.index >= this.parent.blocks.length - 1) return null;
		return this.parent.blocks[this.index + 1];
	}

	// Access root timeline from all layers and blocks
	public getTimeline() {
		return this.parent.getTimeline();
	}

	public getLayer() {
		return this.parent;
	}

	public getByKey(absKey: string): ITimelineChild | null {
		const parts = absKey.split('.');
		const layer = this.layers.find((o) => o.key === parts[0]);
		if (layer) {
			if (parts.length === 1) {
				return layer;
			}
			return layer.getByKey(parts.slice(1).join('.'));
		}
		return null;
	}
}

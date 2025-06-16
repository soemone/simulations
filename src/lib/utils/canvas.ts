import { writable } from 'svelte/store';
import type { CircleOptions, DrawOptions, PathOptions, TextOptions } from '$lib/types/canvas';
import { Vec } from './vector';
import { simulation, type SimulationState } from '$lib/simulation';

// One global instance of the canvas
export const canvas = writable<HTMLCanvasElement | null>(null);

let ctx: CanvasRenderingContext2D | null = null;
let simulationState: SimulationState | null = null;

let [entities, entityKey] = [new Map<number, Entity>(), 0];

// Whenever a new Canvas element gets created, use the most recent ctx on it
canvas.subscribe((value) => (ctx = value?.getContext('2d') || null));

simulation.subscribe((value: SimulationState) => (simulationState = value));

let drawFromCenter = true;
let showFPS = false;

let callbacks = {
	mousemove: new Map<number, (e: MouseEvent) => void>(),
	mousedown: new Map<number, (e: MouseEvent) => void>(),
	click: new Map<number, (e: MouseEvent) => void>()
};

let keys: any = {};

for (let [key, _item] of Object.entries(callbacks)) {
	keys[key] = 0;
}

export const onMousemove = (e: MouseEvent) => {
	for (let [_key, callback] of callbacks.mousemove) callback(e);
};

export const onClick = (e: MouseEvent) => {
	for (let [_key, callback] of callbacks.click) callback(e);
};

export const onMousedown = (e: MouseEvent) => {
	for (let [_key, callback] of callbacks.mousedown) callback(e);
};

// This must run when a new page loads
export const initCanvas = () => {
	// Remove all elements when initializing the page
	entities.clear();
};

const addCallback = <T>(name: keyof typeof callbacks, callback: (e: T) => void) => {
	callbacks[name]?.set(keys[name], callback as any);
	keys[name] += 1;
	return keys[name] - 1;
};

const addEntity = (entity: Entity) => {
	entities.set(entityKey, entity);
	entityKey += 1;
	return entityKey - 1;
};

const setCanvasOptions = (ctx: CanvasRenderingContext2D, options?: DrawOptions) => {
	ctx.strokeStyle = options?.stroke || '';
	ctx.lineWidth = options?.lineWidth || 0;
	ctx.fillStyle = options?.fill || '';
};

const runCanvasOptions = (ctx: CanvasRenderingContext2D, options?: DrawOptions) => {
	if (options?.stroke) ctx.stroke();
	if (options?.fill) ctx.fill();
};

export const setDrawFromCenter = (value: boolean) => (drawFromCenter = value);

export const showFps = (show: boolean = true) => (showFPS = show);

export const clear = () => ctx!.clearRect(0, 0, ctx!.canvas.width, ctx!.canvas.height);

// The base element that is rendered. The `Entity` class by itself does not draw anything on the canvas,
// draw function must be overridden.
export class Entity {
	private _hidden: boolean;
	private _id: number;

	focused: boolean;
	hover: boolean;

	// Allow specific elements to have a translated coordinate system from the center
	drawFromCenter: boolean;

	constructor(options?: DrawOptions) {
		this._hidden = false;

		this.focused = false;
		this.hover = false;

		// But by default take on the global default
		this.drawFromCenter = options?.drawFromCenter ?? drawFromCenter;
		// Add this to the list of elements
		this._id = addEntity(this);
	}

	setDrawFromCenter(newDrawFromCenter: boolean) {
		this.drawFromCenter = newDrawFromCenter;
	}

	draw(_ctx: CanvasRenderingContext2D) {
		// nothing here
	}

	hide() {
		this._hidden = true;
	}

	show() {
		this._hidden = false;
	}

	isHidden() {
		return this._hidden;
	}

	setHidden(hidden: boolean) {
		this._hidden = hidden;
	}

	remove() {
		entities.delete(this._id);
	}

    isSame(other: Entity) {
        return this._id == other._id;
    }
}

// A circle
export class Circle extends Entity {
	options: CircleOptions;

	constructor(options: CircleOptions) {
		super(options);

		this.options = options;
	}

	override draw(ctx: CanvasRenderingContext2D) {
		return new Promise((resolve) => {
			let options = { ...this.options };
			ctx.beginPath();

			if (this.focused) options.stroke = simulationState?.clickStroke;
			if (this.hover) options.stroke = simulationState?.hoverStroke;

			setCanvasOptions(ctx, options);

			const mul = this.drawFromCenter ? 0.5 : 0;
			ctx.arc(
				options.pos.x + ctx.canvas.width * mul,
				options.pos.y + ctx.canvas.height * mul,
				options.radius,
				0,
				Math.PI * 2,
				false
			);

			runCanvasOptions(ctx, options);
			ctx.closePath();

			resolve(null);
		});
	}

	setRadius(newRadius: number) {
		this.options.radius = newRadius;
	}

	setPos(newPos: Vec) {
		this.options.pos = newPos;
	}

	setOptions(newOptions: CircleOptions) {
		Object.assign(this, new Circle(newOptions));
	}

	getPos() {
		return this.options.pos;
	}

	getRadius() {
		return this.options.radius;
	}

	getOptions() {
		return this.options;
	}
}

// An entity that displays the trajectory of a given point
export class Path extends Entity {
	options: PathOptions;
	points: Vec[];
	afterEvery: number | null;
	pointCheck: number;

	constructor(options?: PathOptions) {
		super(options);

		this.options = options ?? { start: Vec.new() };
		this.points = new Array(options?.start.copy() || Vec.new());
		this.afterEvery = options?.afterEvery ?? null;
		this.pointCheck = 0;

		if (options?.watchStart && options?.start) {
			options.start.onChange((newValue) => this.add(newValue));
		}
	}

	override draw(ctx: CanvasRenderingContext2D) {
		return new Promise((resolve) => {
			if (this.points.length < 1) return;
			ctx.beginPath();

			setCanvasOptions(ctx, this.options);

			const mul = this.drawFromCenter ? 0.5 : 0;

			ctx.moveTo(
				this.points[0].x + ctx.canvas.width * mul,
				this.points[0].y + ctx.canvas.height * mul
			);

			for (let point = 1; point < this.points.length; point++)
				ctx.lineTo(
					this.points[point].x + ctx.canvas.width * mul,
					this.points[point].y + ctx.canvas.height * mul
				);

			runCanvasOptions(ctx, this.options);

			ctx.closePath();
			resolve(null);
		});
	}

	private _checkPoints() {
		return new Promise((resolve) => {
			const maxCount = this.options.maxCount ?? 0;
			if (this.points.length > maxCount) {
				// points = points.slice(points.length - maxCount);
				this.points.splice(0, this.points.length - maxCount);
			}
			resolve(null);
		});
	}

	add(point: Vec) {
		return new Promise((resolve) => {
			if (this.afterEvery ?? false) {
				if (this.pointCheck >= (this.afterEvery ?? 0)) {
					this.points.push(point.copy());
					this.pointCheck = 0;
				} else {
					this.pointCheck += 1;
				}
			} else {
				this.points.push(point.copy());
			}
			
			this._checkPoints().then(() => resolve(null));
		});
	}

	updateAfterEvery(n: number) { // points
		this.afterEvery = n;
	}

	setMaxCount(newMaxCount: number) {
		this.options.maxCount = newMaxCount;
	}

	setLineWidth(newLineWidth: number) {
		this.options.lineWidth = newLineWidth;
	}
}

export class Text extends Entity {
	options: TextOptions;

	constructor(options: TextOptions) {
		super(options);
		this.options = options;
	}

	override draw(ctx: CanvasRenderingContext2D) {
		return new Promise((resolve) => {
			ctx.beginPath();
			setCanvasOptions(ctx, this.options);

			ctx.font = this.options?.font ?? '20px Arial';
			ctx.textAlign = this.options?.textAlign ?? 'left';
			ctx.textBaseline = this.options?.textBaseline ?? 'top';

			const mul = this.drawFromCenter ? 0.5 : 0;

			ctx.fillText(
				this.options.text,
				this.options.pos.x + ctx.canvas.width * mul,
				this.options.pos.y + ctx.canvas.height * mul,
				this.options.maxWidth
			);

			runCanvasOptions(ctx, this.options);
			ctx.closePath();

			resolve(null);
		});
	}

	setText(newText: string) {
		this.options.text = newText;
	}

	setPos(newPos: Vec) {
		this.options.pos = newPos;
	}

	setOptions(newOptions: TextOptions) {
		this.options = newOptions;
	}
}

export class DrawController {
	paused: null | boolean;
	drawFunction: Function;
	private _id: number;
	private fpsText: Text;
	private time: any;
	private frames: any;
	private fps: any;

	constructor(drawFuncion: Function) {
		this.paused = null;
		this.drawFunction = drawFuncion;
		this._id = -1;

		[this.time, this.frames, this.fps] = [0, 0, 165];

		this.fpsText = new Text({
			text: `FPS: ${this.fps}`,
			pos: Vec.new(50, 50),
			fill: 'white',
			drawFromCenter: false
		});
	}

	run() {
		// Don't re-run if it's already active
		if (!(this.paused ?? true)) return;

		this.paused = false;
		let startTime = performance.now();

		let loop = () => {
			if (!ctx) return;

			let frameTime = (performance.now() - startTime) / 1000;
			ctx.clearRect(0, 0, ctx!.canvas.width, ctx!.canvas.height);

			this.fpsText.setHidden(!showFPS);

			if (showFPS) {
				this.time += frameTime;
				this.frames += 1;
				if (this.time >= 0.5) {
					this.fps = this.frames / this.time;
					this.time = 0;
					this.frames = 0;
				}
				this.fpsText.setText(`FPS: ${this.fps.toFixed(2)}`);
			}

			this.drawFunction(frameTime);

			for (const [_key, element] of entities) {
				if (!element.isHidden()) element.draw(ctx);
			}

			startTime = performance.now();
			if (this.paused === false) this._id = window.requestAnimationFrame(loop);
		};

		this._id = window.requestAnimationFrame(loop);
	}

	pause() {
		this.paused = true;
		window.cancelAnimationFrame(this._id);
	}

	isRunning() {
		return !(this.paused ?? true);
	}
}

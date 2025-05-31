import { writable } from 'svelte/store';
import type { CircleOptions, DrawOptions, PathOptions, TextOptions } from '$lib/types/canvas';
import { Vec } from './vector';

// One global instance of the canvas
export const canvas = writable<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;

// Whenever a new Canvas element gets created, use the most recent ctx on it
canvas.subscribe((value) => (ctx = value?.getContext('2d') || null));

let useCentralPosition = false;
let showFPS = false;

const setCanvasOptions = (ctx: CanvasRenderingContext2D, options?: DrawOptions) => {
	ctx.strokeStyle = options?.stroke || '';
	ctx.lineWidth = options?.lineWidth || 0;
	ctx.fillStyle = options?.fill || '';
};

const runCanvasOptions = (ctx: CanvasRenderingContext2D, options?: DrawOptions) => {
	if (options?.stroke) ctx.stroke();
	if (options?.fill) ctx.fill();
};

const internalCircle = (
	pos: Vec,
	radius: number,
	ctx: CanvasRenderingContext2D,
	options?: DrawOptions
) => {
	ctx.beginPath();
	setCanvasOptions(ctx, options);
	const mul = useCentralPosition ? 0 : 0.5;
	ctx.arc(
		pos.x + ctx.canvas.width * mul,
		pos.y + ctx.canvas.height * mul,
		radius,
		0,
		Math.PI * 2,
		false
	);
	runCanvasOptions(ctx, options);
	ctx.closePath();
};

const internalPath = (points: Vec[], ctx: CanvasRenderingContext2D, options?: PathOptions) => {
	if (points.length < 1) return;
	ctx.beginPath();
	setCanvasOptions(ctx, options);
	const mul = useCentralPosition ? 0 : 0.5;
	ctx.moveTo(points[0].x + ctx.canvas.width * mul, points[0].y + ctx.canvas.height * mul);
	for (let point = 1; point < points.length; point++) {
		ctx.lineTo(points[point].x + ctx.canvas.width * mul, points[point].y + ctx.canvas.height * mul);
	}
	runCanvasOptions(ctx, options);
	ctx.closePath();
};

export const setCentralPositionMode = (value: boolean) => (useCentralPosition = value);

export const showFps = (show: boolean = true) => (showFPS = show);

export const clear = () => ctx!.clearRect(0, 0, ctx!.canvas.width, ctx!.canvas.height);

export const Text = (options: TextOptions) => {
	let text = options.text;
	let pos = options.pos;
	let drawOptions = options;

	return {
		setText(newText: string) {
			text = newText;
		},

		setPos(newPos: Vec) {
			pos = newPos;
		},

		setOptions(newOptions: TextOptions) {
			drawOptions = newOptions;
		},

		draw: () => {
			if (!ctx) return;
			ctx.beginPath();
			setCanvasOptions(ctx, drawOptions);
			ctx.font = drawOptions?.font || '20px Arial';
			ctx.textAlign = drawOptions.textAlign || 'left';
			ctx.textBaseline = drawOptions.textBaseline || 'top';
			const mul = useCentralPosition ? 0 : 0.5;
			ctx.fillText(
				text,
				pos.x + ctx.canvas.width * mul,
				pos.y + ctx.canvas.height * mul,
				drawOptions.maxWidth
			);
			runCanvasOptions(ctx, drawOptions);
			ctx.closePath();
		}
	};
};

// Could definetly be faster
export const Path = (options?: PathOptions) => {
	let maxCount = options?.maxCount || 0;
	let points = new Array(options?.start.copy() || Vec.new());
	let elapsed = 0;

	const checkPoints = () => {
		return new Promise((resolve) => {
			if (maxCount != undefined && points.length > maxCount) {
				// points = points.slice(points.length - maxCount);
				points.splice(0, points.length - maxCount);
			}
			resolve(null);
		});
	};

	const add = (point: Vec) => {
		return new Promise((resolve) => {
			points.push(point.copy());
			checkPoints().then(() => resolve(null));
		});
	};

	if (options?.watchStart && options?.start) {
		options.start.onChange((newValue) => add(newValue));
	}

	return {
		add,

		// Remove rate per ms
		remove: (rate: number, frameTime: number) => {
			return new Promise((resolve) => {
				elapsed += frameTime;
				const removeCount = Math.floor(elapsed * rate);
				for (let i = 0; i < removeCount; i++) {
					points.shift();
				}
				// points = points.splice(-1, removeCount);
				if (removeCount > 0) {
					elapsed = 0;
				}
				resolve(null);
			});
		},

		reset: () => {
			points = [points[0] || Vec.new()];
			elapsed = 0;
		},

		setMaxCount: (newMaxCount: number) => (maxCount = newMaxCount),

		setLineWidth: (newLineWidth: number) => {
			if (options) options.lineWidth = newLineWidth;
		},

		// Queue the drawing of the path
		draw: () =>
			new Promise((resolve) => {
				internalPath(points, ctx!, options);
				resolve(null);
			})
	};
};

export const Circle = (options: CircleOptions) => {
	let drawOptions = options;
	let drawPos = options.pos || Vec.new(0, 0);
	let drawRadius = options.radius || 0;
	return {
		draw: () => internalCircle(drawPos, drawRadius, ctx!, drawOptions),

		setPos: function (newPos: Vec) {
			drawPos = newPos;
			return this;
		},

		setRadius: function (newRadius: number) {
			drawRadius = newRadius;
			return this;
		},

		setOptions: function (newOptions: CircleOptions) {
			drawOptions = newOptions;
			return this;
		},

		getPos: () => drawPos,

		getRadius: () => drawRadius,

		getOptions: () => drawOptions
	};
};

export const DrawController = (drawFunction: Function) => {
	if (!ctx) return;

	let startTime = performance.now();
	let paused: boolean | null = null;

	let time = 0;
	let frames = 0;
	let fps = 165;

	let id = -1;

	let fpsText = Text({ text: `FPS: ${fps.toFixed(2)}`, pos: Vec.new(50, 50), fill: 'white' });

	let loop = () => {
		let frameTime = (performance.now() - startTime) / 1000;
		ctx!.clearRect(0, 0, ctx!.canvas.width, ctx!.canvas.height);

		if (showFPS) {
			time += frameTime;
			frames += 1;
			if (time >= 0.5) {
				fps = frames / time;
				time = 0;
				frames = 0;
			}
			let prevCenter = useCentralPosition;
			useCentralPosition = true;
			fpsText.setText(`FPS: ${fps.toFixed(2)}`);
			fpsText.draw();
			useCentralPosition = prevCenter;
		}

		drawFunction(frameTime);

		startTime = performance.now();
		if (paused === false) id = window.requestAnimationFrame(loop);
	};

	return {
		run: () => {
			// Don't run if it's already running
			if (!(paused ?? true)) return;
			paused = false;
			startTime = performance.now();
			id = window.requestAnimationFrame(loop);
		},

		pause: () => {
			paused = true;
			window.cancelAnimationFrame(id);
		},

		isRunning: () => {
			return !(paused ?? true);
		}
	};
};

export const getContext = () => ctx;

export class DrawControllerM {
	draw: Function;
	paused: boolean | null;
	private id: number;

	constructor(draw: Function) {
		this.draw = draw;
		this.paused = null;
		this.id = -1;
	}

	pause() {
		this.paused = true;
		window.cancelAnimationFrame(this.id);
	}

	run() {
		this.paused = false;

		const loop = () => {
			ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			this.draw();
			if (!this.paused) window.requestAnimationFrame(loop);
		};

		window.requestAnimationFrame(loop);
	}

	isRunning() {
		return (this.paused ?? true) ? false : true;
	}
}

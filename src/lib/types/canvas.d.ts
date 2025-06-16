import type { Vec } from '$lib/utils/vector';

export interface DrawOptions {
	stroke?: string | CanvasGradient | CanvasPattern;
	lineWidth?: number;
	fill?: string | CanvasGradient | CanvasPattern;
	drawFromCenter?: boolean;
}

export interface PathOptions extends DrawOptions {
	maxCount?: number;
	watchStart?: boolean;
	start: Vec;
	afterEvery?: number;
}

export interface CircleOptions extends DrawOptions {
	radius: number;
	pos: Vec;
}

export interface TextOptions extends DrawOptions {
	font?: string;
	textAlign?: CanvasTextAlign;
	textBaseline?: CanvasTextBaseline;
	maxWidth?: number;
	text: string;
	pos: Vec;
}

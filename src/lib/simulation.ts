// Global "variables" for the simulations

import { writable } from 'svelte/store';

export interface SimulationState {
	paused: null | boolean;
	drawerPause: boolean;
	drawerOpen: boolean;
	pathColor: string;
	circleColor: string;
	hoverStroke: string;
	clickStroke: string;
}

export type Direction = 'left' | 'right' | 'none';

export const simulationDefaults: SimulationState = {
	paused: null,
	drawerPause: true,
	drawerOpen: false,
	pathColor: 'hsl(40, 80%, 35%)',
	circleColor: 'hsl(51, 100%, 48%)',
	hoverStroke: 'hsl(210, 60%, 52%)',
	clickStroke: 'hsl(200, 100%, 52%)',
};

export const simulation = writable<SimulationState>({ ...simulationDefaults });
export const direction = writable<Direction>('none');

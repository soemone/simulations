<script lang="ts">
	import Canvas from '$lib/components/canvas.svelte';
	import {
		Circle,
		DrawController,
		initCanvas,
		Path,
		setDrawFromCenter,
		showFps,
		Text
	} from '$lib/utils/canvas';
	import { onMount } from 'svelte';
	import { simulation } from '$lib/simulation';
	import { Vec } from '$lib/utils/vector';
	import type { CircleOptions } from '$lib/types/canvas';

	interface PlanetOptions extends CircleOptions {
		mass: number;
		velocity: Vec;
		acceleration: Vec;
		movable: boolean;
		prevPos: Vec;
	}

	class Planet extends Circle {
		data: PlanetOptions;

		constructor(options: PlanetOptions) {
			options.fill = $simulation.circleColor;
			super(options);

			this.data = options;
		}
	}

	let objects = $state<null | { circles: Planet[]; paths: Path[] }>(null);

	// Put (0, 0) at the center of the page
	setDrawFromCenter(true);

	const m = 10000,
		G = 39.5,
		L = 300,
		r = L / Math.sqrt(2),
		v = Math.sqrt((G * m) / L);
	const stepTime = 1 / 240;
	const defaults = {
		G,
		stepTime,
		stepPerFrame: 60,
		pathLength: 1000,
		updateAfterEvery: 1 / (10 * stepTime),
		circles: [
			{
				pos: Vec.new(r, 0),
				velocity: Vec.new(0, v),
				mass: m,
				radius: 15,
				movable: true,
				prevPos: Vec.new(0, 0),
				acceleration: Vec.new(0, 0)
			},
			{
				pos: Vec.new(-r / 2, L / 2),
				velocity: Vec.new((-v * Math.sqrt(3)) / 2, -v / 2),
				mass: m,
				radius: 15,
				movable: true,
				prevPos: Vec.new(0, 0),
				acceleration: Vec.new(0, 0)
			},
			{
				pos: Vec.new(-r / 2, -L / 2),
				velocity: Vec.new((v * Math.sqrt(3)) / 2, -v / 2),
				mass: m,
				radius: 15,
				movable: true,
				prevPos: Vec.new(0, 0),
				acceleration: Vec.new(0, 0)
			}
		]
	};

	let values = $state(defaults);
	const init = () => {
		let COM = new Circle({ radius: 7.5, pos: Vec.new(0, 0), stroke: $simulation.circleColor });
		let COMText = new Text({
			pos: Vec.new(15, -7.5),
			text: 'COM',
			font: 'bold 15px Arial',
			fill: $simulation.pathColor
		});
		$simulation.drawerPause = true;

		objects = {
			circles: [],
			paths: []
		};

		// Compute the acceleration in the next step
		const computeAccels = () => {
			// Reset acceleration after every step
			for (let planet of values.circles) {
				planet.acceleration.set(0, 0);
			}

			for (let i = 0; i < values.circles.length - 1; i++) {
				const planet = values.circles[i];

				for (let j = i + 1; j < values.circles.length; j++) {
					const otherPlanet = values.circles[j];
					const displacement = Vec.sub(planet.pos, otherPlanet.pos);
					const distanceSq = displacement.magSq;
					const normalizedDisplacement = displacement.normalize();
					const acceleration = values.G / distanceSq;

					// Acceleration due to gravity on planet due to other planet
					planet.acceleration.add(
						Vec.mulK(normalizedDisplacement, -acceleration * otherPlanet.mass)
					);
					otherPlanet.acceleration.add(
						Vec.mulK(normalizedDisplacement, acceleration * planet.mass)
					);
				}
			}
		};

		computeAccels();

		for (const circle of values.circles) {
			objects.paths.push(
				new Path({
					watchStart: true,
					maxCount: values.pathLength,
					start: circle.pos,
					stroke: $simulation.pathColor,
					lineWidth: 3,
					afterEvery: values.updateAfterEvery
				})
			);

			circle.prevPos = circle.pos.copy();
			// x(dt) = 2 * x(0) - x(0) + a(0) * dt * dt
			circle.pos.add(Vec.mulK(circle.velocity, values.stepTime));
			circle.pos.add(Vec.mulK(circle.acceleration, 0.5 * values.stepTime * values.stepTime));

			objects.circles.push(
				new Planet({
					...circle
				})
			);
		}

		showFps(true);

		const step = () => {
			return new Promise((resolve) => {
				// Position verlet integrator, probably
				computeAccels();
				let com = Vec.new(0, 0);
				for (let planet of values.circles) {
					if (planet.movable) {
						// x (t + dt) = 2x(t) - x(t - dt) + a(t) (dt)^2
						const currentPos = planet.pos.copy();
						planet.acceleration.mulK(values.stepTime * values.stepTime);
						const nextPos = Vec.add(
							Vec.sub(Vec.mulK(currentPos, 2), planet.prevPos),
							planet.acceleration
						);
						planet.prevPos = currentPos;
						planet.pos.setVec(nextPos);
						com.add(planet.pos);
					}
				}
				com.divK(values.circles.length);
				COM.setPos(com);
				COMText.setPos(Vec.add(com, Vec.new(15, -7.5)));
				resolve(null);
			});
		};

		let elapsed = 0;
		let drawController = new DrawController((frameTime: number) => {
			// Perform a step at constant intervals, or if enough frames are not rendered per second, multiple
			// This allows the simulation to behave as deterministically as possible.
			elapsed += frameTime;
			// If more than 100 frames have passed since the simulation was paused, just continue from where it stopped
			if (elapsed > 100 * values.stepTime) {
				elapsed = 0;
				return;
			}

			while (elapsed > values.stepTime) {
				elapsed -= values.stepTime;
				for (let i = 0; i < values.stepPerFrame; i++) step();
			}
		});

		$effect(() => {
			if ($simulation.paused) {
				drawController?.pause();
			} else {
				drawController?.run();
			}
		});
	};

	onMount(() => {
		initCanvas();
		init();
	});
</script>

<Canvas></Canvas>

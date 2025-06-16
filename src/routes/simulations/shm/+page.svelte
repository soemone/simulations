<script lang="ts">
	import Button from '$lib/components/button.svelte';
	import Canvas from '$lib/components/canvas.svelte';
	import Checkbox from '$lib/components/checkbox.svelte';
	import Drawer from '$lib/components/drawer.svelte';
	import Slider from '$lib/components/slider.svelte';
	import { simulation } from '$lib/simulation';
	import {
		Circle,
		DrawController,
		initCanvas,
		Path,
		setDrawFromCenter,
		showFps
	} from '$lib/utils/canvas';
	import { Vec } from '$lib/utils/vector';
	import { onMount } from 'svelte';

	const defaults = {
		maxCount: 210,
		lerpFactor: 1,
		circleRadius: 10,
		pathWidth: 3,
		showCircle: true,
		showPath: true,
		showFPS: true,
		freqX: 8,
		freqY: 12,
		phase: 0,
		phaseSpeed: 0.33,
		timeStep: 60,
		boxX: 300,
		boxY: 200
	};

	let windowSize = $state(Vec.new(320, 220));

	let values = $state(defaults);

	const shm = {
		pos: Vec.new(300, 300),
		phase: 0,
		time: 0
	};

	let objects = $state<null | { path: Path; circle: Circle }>(null);

	const init = () => {
		$simulation.drawerPause = false;
		setDrawFromCenter(true);
		windowResize();

		objects = {
			path: new Path({
				maxCount: values.maxCount,
				start: shm.pos,
				watchStart: true,
				stroke: $simulation.pathColor,
				lineWidth: values.pathWidth
			}),
			circle: new Circle({
				pos: shm.pos,
				radius: values.circleRadius,
				fill: $simulation.circleColor
			})
		};

		showFps(true);

		const draw = (frameTime: number) => {
			for (let i = 0; i < values.timeStep; i++) {
				shm.phase += values.phaseSpeed * frameTime;
				shm.time += frameTime;
				let new_pos = Vec.new(
					values.boxX * Math.cos(values.freqX * shm.time),
					values.boxY *
						Math.sin(values.freqY * shm.time + ((values.phase + shm.phase) * Math.PI) / 180)
				);
				shm.pos.lerp(new_pos, values.lerpFactor);
			}

			objects!.path.setHidden(!values.showPath);
			objects!.circle.setHidden(!values.showCircle);
		};

		let drawController = new DrawController(draw);

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

	const windowResize = () => {
		windowSize = Vec.new(
			(window.innerWidth * window.devicePixelRatio) / 2,
			(window.innerHeight * window.devicePixelRatio) / 2
		);
	};

	const reset = () => {
		values = defaults;
		objects!.path.setMaxCount(values.maxCount);
		objects!.circle.setRadius(values.circleRadius);
		objects!.path.setLineWidth(values.pathWidth);
	};
</script>

<svelte:window onresize={windowResize} />

<Canvas></Canvas>
<Drawer title="SHM" class="text-foreground-readable">
	<div class="relative w-full text-sm">
		A simulation that models simple harmonic motion in 2 dimensions
		<br />
		<br />
		Here, you can control:
		<ul class="list-disc px-5">
			<li>the <b>maximum path points</b> that your shm trajectory can have</li>
			<li>
				the <b>linear interpolation factor</b> - higher values are less smooth than lower values, but
				they follow the path of the shm more accurately while being less susceptible to framerate changes
			</li>
			<li>the <b>radius of the circle</b> and the <b>line size of the path</b></li>
			<li>
				the <b>time step</b> - higher values make the simulation run faster, but you don't see every
				frame, only what's calculated &lt;timestep&gt; frames from the last shown frame
			</li>
			<li>
				the <b>frequency</b> - you can change the X and Y frequencies to achieve different effects
			</li>
			<li>
				the <b>box sizes</b> - you can change the X and Y box sizes to change the aspect ratio and size
				of the resulting animation
			</li>
			<li>
				the <b>phase difference</b> - this is the phase applied to the sin function such that it leads
				the cos function by &lt;phase°&gt;
			</li>
			<li>
				the <b>phase speed</b> - this is the amount in degrees that the phase is increased by each frame
			</li>
			<li>the <b>visibility</b> of the circle and the path</li>
		</ul>
		<br />
		Note that the simulation may seem like it vibrates at high time-steps and relatively stable x and
		y frequencies. This happens due to lack of smoothing of the path lines drawn by the circle. A lower
		frequency combination will have a more smooth path than a higher frequency combination: Ex. 2:3 will
		have a more smooth path than 32:48
	</div>

	<Slider
		type="single"
		bind:value={values.maxCount}
		min={30}
		max={9000}
		step={30}
		disabled={!values.showPath}
		onValueCommit={() => objects!.path.setMaxCount(values.maxCount)}
	>
		<span>Max path points</span>
	</Slider>

	<Slider
		type="single"
		bind:value={values.pathWidth}
		min={1}
		max={10}
		step={1}
		disabled={!values.showPath}
		onValueCommit={() => objects!.path.setLineWidth(values.pathWidth)}
	>
		<span>Path width</span>
	</Slider>

	<Slider type="single" bind:value={values.lerpFactor} min={0.01} max={1} step={0.005}>
		<span>Interpolation factor</span>
	</Slider>

	<Slider type="single" bind:value={values.timeStep} min={1} max={60} step={1}>
		<span>Timestep</span>
	</Slider>

	<Slider
		type="single"
		bind:value={values.circleRadius}
		min={10}
		max={100}
		step={1}
		disabled={!values.showCircle}
		onValueCommit={() => objects!.circle.setRadius(values.circleRadius)}
	>
		<span>Circle radius</span>
	</Slider>

	<Slider type="single" bind:value={values.freqX} min={0} max={100} step={0.01}>
		<span>X frequency</span>
	</Slider>

	<Slider type="single" bind:value={values.freqY} min={0} max={100} step={0.01}>
		<span>Y frequency</span>
	</Slider>

	<Slider type="single" bind:value={values.boxX} min={20} max={windowSize.x - 20} step={1}>
		<span>Box width</span>
	</Slider>

	<Slider type="single" bind:value={values.boxY} min={20} max={windowSize.y - 20} step={1}>
		<span>Box height</span>
	</Slider>

	<Slider type="single" bind:value={values.phase} min={0} max={360} step={0.1} postfix="°">
		<span>Phase difference (degrees)</span>
	</Slider>

	<Slider type="single" bind:value={values.phaseSpeed} min={0} max={10} step={0.01}>
		<span>Phase speed</span>
	</Slider>

	<Checkbox bind:checked={values.showCircle}>Show circle</Checkbox>
	<Checkbox bind:checked={values.showPath}>Show path</Checkbox>
	<Checkbox bind:checked={values.showFPS} onCheckedChange={(value: boolean) => showFps(value)}>
		Show FPS
	</Checkbox>
	<Button onclick={reset}>Reset</Button>
</Drawer>

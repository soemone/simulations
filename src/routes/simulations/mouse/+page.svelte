<script lang="ts">
	import Canvas from '$lib/components/canvas.svelte';
	import Drawer from '$lib/components/drawer.svelte';
	import Slider from '$lib/components/slider.svelte';
	import Checkbox from '$lib/components/checkbox.svelte';
	import { Circle, DrawController, Path, setCentralPositionMode, showFps } from '$lib/utils/canvas';
	import { Vec } from '$lib/utils/vector';
	import Button from '$lib/components/button.svelte';
	import { onMount } from 'svelte';
	import { simulation } from '$lib/simulation';

	const mouse = {
		dispPos: Vec.new(300, 300),
		toPos: Vec.new(300, 300)
	};

	const defaults = {
		maxCount: 1500,
		lerpFactor: 0.25,
		circleRadius: 20,
		pathWidth: 2,
		showCircle: true,
		showPath: true,
		showFPS: true
	};

	let values = $state(defaults);
	let open = $state(false);

	let objects = $state<null | { path: ReturnType<typeof Path>; circle: ReturnType<typeof Circle> }>(
		null
	);

	setCentralPositionMode(true);

	const init = () => {
		$simulation.drawerPause = true;

		objects = {
			circle: Circle({
				pos: mouse.dispPos,
				radius: values.circleRadius,
				fill: $simulation.circleColor
			}),
			path: Path({
				maxCount: values.maxCount,
				watchStart: true,
				start: mouse.dispPos,
				stroke: $simulation.pathColor,
				lineWidth: values.pathWidth
			})
		};

		showFps(values.showFPS);

		let drawController = DrawController((frameTime: number) => {
			mouse.dispPos.lerp(mouse.toPos, values.lerpFactor);
			objects!.path.add(mouse.dispPos);
			values.showPath ? objects!.path.draw() : null;
			values.showCircle ? objects!.circle.draw() : null;
		});

		$effect(() => {
			if ($simulation.paused) {
				drawController?.pause();
			} else {
				drawController?.run();
			}
		});
	};

	const mousemove = (event: MouseEvent) => {
		mouse.toPos.x = event.clientX * window.devicePixelRatio;
		mouse.toPos.y = event.clientY * window.devicePixelRatio;
	};

	const touchmove = (event: TouchEvent) => {
		mouse.toPos.x = event.touches[0].clientX * window.devicePixelRatio;
		mouse.toPos.y = event.touches[0].clientY * window.devicePixelRatio;
	};

	onMount(() => init());

	const reset = () => {
		values = defaults;
		objects!.path.setMaxCount(values.maxCount);
		objects!.path.setLineWidth(values.pathWidth);
		objects!.circle.setRadius(values.circleRadius);
	};
</script>

<svelte:body onmousemove={mousemove} ontouchmove={touchmove} />
<Canvas></Canvas>
<Drawer title="Mouse" bind:open class="text-foreground-readable">
	<div class="relative w-full text-sm ">
		A thing that follows the mouse cursor. To smoothen the animation, the objects are linearly
		interpolated to the cursor.
		<br />
		<br />
		Here, you can control:
		<ul class="list-disc px-5">
			<li>the <b>maximum path points</b> that your cursor trajectory can have</li>
			<li>
				the <b>linear interpolation factor</b> - higher values are less smooth than lower values, but
				they follow the cursor more accurately
			</li>
			<li>the <b>radius of the circle</b> and the <b>line size of the path</b></li>
			<li>the <b>visibility</b> of the circle and the path</li>
		</ul>
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

	<Checkbox bind:checked={values.showCircle}>Show circle</Checkbox>
	<Checkbox bind:checked={values.showPath}>Show path</Checkbox>
	<Checkbox bind:checked={values.showFPS} onCheckedChange={(value: boolean) => showFps(value)}
		>Show FPS</Checkbox
	>
	<Button onclick={reset}>Reset</Button>
</Drawer>

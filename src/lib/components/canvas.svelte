<script lang="ts">
	import { onMount } from 'svelte';
	import { canvas as canvasInstance, onClick, onMousedown, onMousemove } from '$lib/utils/canvas';

	const resize = () => {
		if (!$canvasInstance) return;
		$canvasInstance.width = window.devicePixelRatio * window.innerWidth;
		$canvasInstance.height = window.devicePixelRatio * window.innerHeight;
	};

	onMount(() => {
		console.log('canvas component loaded!');
		resize();
	});
</script>

<svelte:window onresize={resize} />
<canvas
	bind:this={$canvasInstance}
	onmousemove={onMousemove}
	onclick={onClick}
	onmousedown={onMousedown}
	class="bg-background h-screen w-screen"
>
	Your browser or device does not support the HTML5 canvas spec
</canvas>

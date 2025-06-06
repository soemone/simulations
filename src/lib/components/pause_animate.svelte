<script lang="ts">
	import { simulation } from '$lib/simulation';
	import { cn } from '$lib/utils';
	import { Pause, Play } from '@lucide/svelte';
	import { Button } from 'bits-ui';

	let { paused } = $props();

	const onclick = () => {
		$simulation.paused = !($simulation.paused ?? false);
	};
</script>

<div class="pointer-events-none fixed top-[50vh] left-[50vw] translate-[-50%]">
	{#if paused == true}
		<Pause size={72} class="animate-playpause opacity-0" />
	{:else if paused == false}
		<Play size={72} class="animate-playpause opacity-0" />
	{/if}
</div>

<Button.Root
	class={cn(
		'text-foreground bg-secondary hover:bg-secondary/80 hover:text-foreground/80 fixed top-4 right-[50%]',
		'z-20 inline-flex items-center justify-center rounded-md p-1 text-lg font-semibold duration-200 hover:scale-[1.01]',
		'hover:transition-all active:scale-[0.99] active:transition-all',
		!$simulation.drawerPause || !$simulation.drawerOpen
			? ''
			: 'pointer-events-none opacity-0 transition-opacity'
	)}
	{onclick}
>
	{#if $simulation.paused}
		<Play class="inline-block" size={24} />
	{:else}
		<Pause class="inline-block" size={24} />
	{/if}
</Button.Root>

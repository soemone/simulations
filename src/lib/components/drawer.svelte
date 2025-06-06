<script lang="ts">
	import { simulation } from '$lib/simulation';
	import { cn } from '$lib/utils';
	import { PanelRightClose, PanelRightOpen } from '@lucide/svelte';
	import { Button } from 'bits-ui';
	import { onMount } from 'svelte';

	let prevPaused = $state(false);
	let { open = $bindable(false), children, title, ...restProps } = $props();

	onMount(() => (prevPaused = $simulation.paused ?? false));

	const onclick = (event: Event) => {
		open = !open;
		if (open === true) {
			prevPaused = $simulation.paused ?? false;
			if ($simulation.drawerPause) $simulation.paused = true;
		} else if ($simulation.drawerPause) $simulation.paused = prevPaused;
		$simulation.drawerOpen = open;
		// Prevent the button from getting focused and causing problems with the play / pause functionality
		(event.currentTarget as HTMLElement).blur();
		return false;
	};

	const keypress = (event: KeyboardEvent) => {
		if (event.code === 'd' || event.key === 'd' || event.keyCode == 100) {
			onclick(event as Event);
		}
	};
</script>

<svelte:body onkeypress={keypress} />

<Button.Root
	class="text-foreground bg-secondary hover:bg-secondary/80 hover:text-foreground/80 fixed top-4 right-4
        z-20 inline-flex items-center justify-center rounded-md p-1
        text-lg font-semibold duration-200 hover:scale-[1.01] hover:transition-all active:scale-[0.99] active:transition-all"
	{onclick}
>
	{#if open}
		<PanelRightClose class="inline-block" size={24} />
	{:else}
		<PanelRightOpen class="inline-block" size={24} />
	{/if}
</Button.Root>

<span
	class={cn(
		'fixed top-0 h-screen w-90 p-2 transition-all not-sm:w-full',
		open ? 'right-0 opacity-100' : 'right-[-100%] opacity-0',
		{...restProps}.class ?? ''
	)}
>
	<div class="bg-primary shadow-primary flex h-full w-full flex-col rounded-md shadow-lg">
		<div
			class="flex items-center justify-between p-2 text-center text-2xl font-bold"
		>
			{title}
		</div>
		<div class="relative flex h-full flex-col gap-4 overflow-auto p-2 shadow-md">
			{@render children()}
		</div>
	</div>
</span>

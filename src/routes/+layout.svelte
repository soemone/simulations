<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import PauseAnimate from '$lib/components/pause_animate.svelte';
	import { direction, simulation, simulationDefaults } from '$lib/simulation';
	import '../app.css';
	import PageTransition from '$lib/components/page_transition.svelte';

	let { children } = $props();

	const keypress = (event: KeyboardEvent) => {
		// space key toggles pause state
		if (event.code === 'Space' || event.key === ' ' || event.keyCode == 32) {
			event.preventDefault();
			if ($simulation.drawerOpen && $simulation.drawerPause) return;

			if ($simulation.paused === null) $simulation.paused = false;
			$simulation.paused = !$simulation.paused;
		} 
		// b key moves to the "simulation selecttion" page, ie. the home page
		else if (page.url.pathname != '/' && (event.code === 'b' || event.key === 'b' || event.keyCode == 98)) {
			$direction = 'none';
			$simulation = { ...simulationDefaults };
			goto('/');
		}
	};
</script>

<svelte:body onkeypress={keypress} />

<PageTransition key={page.url}>
	{#if page.url.pathname.startsWith('/simulations')}
		<PauseAnimate paused={$simulation.paused} />
	{/if}

	{@render children()}
</PageTransition>

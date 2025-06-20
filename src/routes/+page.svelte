<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/button.svelte';
	import { direction } from '$lib/simulation';
	import { cn } from '$lib/utils';
	import { ArrowRight, ArrowLeft } from '@lucide/svelte';
	import type { Direction } from '$lib/simulation';

	interface SimulationDetails {
		name: string;
		description: string;
		quirk: string;
		location: string;
	}

	const details: SimulationDetails[] = [
		{
			name: 'SHM',
			description: 'Model simple harmonic motion',
			quirk: 'in two dimensions (or three?)',
			location: '/simulations/shm'
		},

		{
			name: 'Gravity',
			description: 'Model gravity inaccurately',
			quirk: 'in the works!!',
			location: '/simulations/gravity'
		},

		{
			name: 'Mouse',
			description: 'A cursor trail visualizer',
			quirk: 'that also supports touchscreens',
			location: '/simulations/mouse'
		},
		{
			name: 'About',
			description: 'Why this must exist',
			quirk: 'also contains keyboard shortcuts!',
			location: '/about'
		}
	];

	let container = $state<null | HTMLElement>(null);
	let navigating = $state(false);
	let internalDirection: Direction = 'none';

	const onclick = (i: number, e: MouseEvent) => {
		e.preventDefault();

		const a = e.currentTarget as HTMLElement;
		const cls = a?.classList;
		container?.classList.add('animate-fade-out');

		if (i % 2 == 0) {
			internalDirection = 'left';
			cls.add('animate-out-left', 'pointer-events-none');
		} else {
			internalDirection = 'right';
			cls.add('animate-out-right', 'pointer-events-none');
		}

		// Not using beforeNavigate here due to it causing wierd issues while trying to
		// navigate using browser controls.
		container?.addEventListener('animationend', async () => {
			// Prevent multiple animations from causing many goto calls
			if (navigating) return;

			navigating = true;
			$direction = internalDirection;
			goto(a.getAttribute('href') ?? '/');
		});
	};
</script>

<div
	class="text-foreground-readable relative grid h-screen w-screen place-items-center overflow-x-hidden overflow-y-auto p-0 lg:py-20"
>
	<div
		bind:this={container}
		class="bg-primary/90 shadow-primary w-full max-w-4xl rounded-md p-4 shadow-lg"
	>
		<div class="mb-4 text-center text-4xl font-bold">Routes</div>
		<div class="m-2 flex h-full flex-col justify-center gap-4 p-1 text-lg">
			{#each details as detail, i}
				<a
					href={detail.location}
					class={cn(
						'block w-full transition-transform',
						i % 2 == 0 ? 'sm:hover:translate-x-6' : 'sm:hover:-translate-x-6'
					)}
					onclick={(e: MouseEvent) => onclick(i, e)}
				>
					<Button class="border-foreground/70 flex h-20 w-full border-2">
						{#if i % 2 == 0}
							<span class="mr-auto text-3xl font-bold not-sm:m-auto">{detail.name}</span>
							<div class="g-1 flex flex-col p-1 not-sm:hidden">
								<span class="text-sm font-bold">{detail.description}</span>
								<span class="text-xs">{detail.quirk}</span>
							</div>
							<div class="px-4 not-sm:hidden sm:ml-auto">
								<ArrowRight size={36} />
							</div>
						{:else}
							<div class="px-4 not-sm:hidden sm:mr-auto">
								<ArrowLeft size={36} />
							</div>
							<div class="g-1 flex flex-col p-1 not-sm:hidden">
								<span class="text-sm font-bold">{detail.description}</span>
								<span class="text-xs">{detail.quirk}</span>
							</div>
							<span class="ml-auto text-3xl font-bold not-sm:m-auto">{detail.name}</span>
						{/if}
					</Button>
				</a>
			{/each}
		</div>
	</div>
</div>

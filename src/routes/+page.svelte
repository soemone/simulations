<script lang="ts">
	import Button from '$lib/components/button.svelte';
	import { cn } from '$lib/utils';
	import { ArrowRight, ArrowLeft } from '@lucide/svelte';

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
		},
	];
</script>

<div class="relative grid h-screen w-screen place-items-center p-0 lg:py-20 overflow-auto text-foreground-readable">
	<div
		class="bg-primary/90 shadow-primary w-full max-w-4xl rounded-md p-4 shadow-lg"
	>
		<div class="text-4xl text-center mb-4 font-bold">Routes</div>
		<div class="m-2 flex h-full flex-col justify-center gap-4 p-1 text-lg">
			{#each details as detail, i}
				<a
					href={detail.location}
					class={cn(
						'block w-full transition-transform',
						i % 2 == 0 ? 'sm:hover:translate-x-6' : 'sm:hover:-translate-x-6'
					)}
				>
					<Button class="border-foreground/70 flex h-20 w-full border-2">
						{#if i % 2 == 0}
							<span class="mr-auto text-3xl font-bold not-sm:m-auto">{detail.name}</span>
							<div class="g-1 flex flex-col p-1 not-sm:hidden">
								<span class="text-sm font-bold">{detail.description}</span>
								<span class="text-xs">{detail.quirk}</span>
							</div>
							<div class="sm:ml-auto px-4 not-sm:hidden">
								<ArrowRight size={36}/>
							</div>
						{:else}
							<div class="sm:mr-auto px-4 not-sm:hidden">
								<ArrowLeft size={36}/>
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

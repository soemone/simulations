<script lang="ts">
	import { direction } from '$lib/simulation';
	import { cn } from '$lib/utils';

	let { key, children } = $props();
	let container = $state<null | HTMLElement>(null);
</script>

{#key key}
	<div
		bind:this={container}
		class={cn(
			'overflow-hidden',
			$direction == 'none'
				? 'animate-fade-in'
				: $direction == 'left'
					? 'animate-in-right'
					: 'animate-in-left'
		)}

		onanimationend={(e) => e.animationName.includes('in') ? container?.classList.remove('overflow-hidden') : ''}
	>
		{@render children()}
	</div>
{/key}

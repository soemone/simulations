<script lang="ts">
	import { Pause, Play } from '@lucide/svelte';

	let { paused } = $props();
</script>

<div class="pointer-events-none fixed top-[50vh] left-[50vw] translate-[-50%]">
	{#if paused == true}
		<Pause size={72} class="animate-playpause opacity-0" />
	{:else if paused == false}
		<Play size={72} class="animate-playpause opacity-0" />
	{/if}
</div>

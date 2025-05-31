<script>
	import Button from '$lib/components/button.svelte';
</script>

<div class="flex h-screen w-screen place-items-center justify-center">
	<div class="text-center text-4xl">
		Go to:
		<div class="m-2 flex flex-col place-items-start gap-2 p-1 text-lg">
			<a href="/simulations/shm" class="block w-full underline">
				<Button class="w-full">SHM</Button>
			</a>
			<a href="/simulations/mouse" class="block w-full underline">
				<Button class="w-full">Mouse</Button>
			</a>
		</div>
	</div>
</div>

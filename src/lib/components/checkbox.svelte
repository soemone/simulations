<script lang="ts">
	import { Checkbox, Label } from 'bits-ui';
	import { Check } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	let { checked = $bindable(false), children, ...restProps } = $props();
</script>

<div class="flex items-center space-x-3">
	<Label.Root for="checkbox">
		{@render children()}
	</Label.Root>
	<Checkbox.Root
		id="checkbox"
		{...restProps as any}
		class={cn(
			'border-secondary bg-secondary-foreground data-[state=unchecked]:bg-background',
			'data-[state=unchecked]:hover:border-secondary-foreground/80 data-[state=unchecked]:hover:bg-secondary',
			'focus:border-secondary-foreground/70 inline-flex size-[25px] items-center justify-center rounded-md border',
			'transition-all duration-150 ease-in-out',
			{ ...restProps }.class ?? ''
		)}
		bind:checked
	>
		{#snippet children({ checked })}
			<div class="text-background inline-flex items-center justify-center">
				{#if checked}
					<Check class="size-[18px]" strokeWidth={3} />
				{/if}
			</div>
		{/snippet}
	</Checkbox.Root>
</div>

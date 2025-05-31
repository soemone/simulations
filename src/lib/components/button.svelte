<script lang="ts">
	import { cn } from '$lib/utils';
	import { Button } from 'bits-ui';
	let { children, ...restProps } = $props();
</script>

<Button.Root
	{...restProps as any}
	class={cn(
		'text-foreground bg-secondary hover:bg-secondary/80 hover:text-foreground/80 duration-200 hover:transition-all',
		'inline-flex h-10 items-center justify-center p-3 text-lg font-semibold hover:scale-[1.01] active:scale-[0.99]',
		'focus:bg-secondary/80 rounded-md outline-0 focus:scale-[1.02] focus:transition-all active:transition-all',
		'focus:text-foreground/80',
		{ ...restProps }?.class ?? ''
	)}
>
	{@render children()}
</Button.Root>

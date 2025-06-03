<script lang="ts">
	import { cn } from '$lib/utils';
	import { Slider } from 'bits-ui';

	let inputValue = $state<string | null>(null);
	let input = $state<HTMLInputElement | null>(null);
	let focused = $state(false);

	let {
		value = $bindable<number>(),
		disabled = false,
		postfix,
		prefix,
		children,
		onValueCommit,
		ref = $bindable<HTMLDivElement | null>(null),
		...restProps
	} = $props<{
		value?: number;
		disabled?: boolean;
		postfix?: string;
		prefix?: string;
		children: () => any;
		onValueCommit?: () => any;
		ref?: HTMLDivElement | null;
		[key: string]: any;
	}>();

	let prevValue = $state(value);

	// Handle the input, and invalid characters
	const oninput = () => {
		inputValue = inputValue?.replace(/[^0-9.]/gi, '') ?? null;
		const number = parseFloat(inputValue ?? '0');
		value = Number.isNaN(number) ? prevValue : number;
	};

	const focus = () => (prevValue = inputValue = value);

	const focusout = () => {
		inputValue = null;
		onValueCommit?.();
	};

	const keypress = (e: KeyboardEvent) => {
		if (e.code == 'Enter' || e.key == 'Enter') {
			inputValue = null;
			onValueCommit?.();
		}
	};

	// Focus input when it's created - ie. the field is clicked
	$effect(() => input?.focus());
</script>

<div class="w-full">
	{@render children()}
	<span class="bg-primary-foreground/50 flex gap-0 rounded-full">
		<span
			class={cn(
				'mx-1 w-fit min-w-14 text-center font-bold',
				disabled ? 'text-foreground-disabled' : 'text-foreground'
			)}
			onclick={focus}
			onfocus={focus}
			role="button"
			tabindex="0"
			onkeypress={null}
		>
			{#if inputValue == null}
				{prefix ? prefix : ''}{value}{postfix ? postfix : ''}
			{:else}
				<input
					bind:value={inputValue}
					bind:this={input}
					class="max-w-14 text-center outline-0"
					type="text"
					{oninput}
					{disabled}
					onfocusout={focusout}
					onkeypress={keypress}
				/>
			{/if}
		</span>
		<Slider.Root
			bind:value
			bind:ref
			{onValueCommit}
			{...restProps as any}
			class={cn(
				'bg-secondary relative flex w-full touch-none items-center rounded-full select-none',
				{ ...restProps }.class ?? ''
			)}
			{disabled}
		>
			<span class="relative h-6 w-full cursor-pointer overflow-hidden">
				<Slider.Range
					class="bg-secondary-foreground data-[disabled]:bg-secondary-foreground-disabled absolute h-full rounded-l-full 
					       transition-all duration-100"
				/>
			</span>
			<Slider.Thumb
				index={0}
				class="bg-primary-foreground block size-[24px] cursor-pointer rounded-full outline-0 transition-all 
				       duration-100 disabled:pointer-events-none disabled:opacity-50  
				{disabled ? 'border-secondary-foreground-disabled' : 'border-secondary-foreground'} 
				{focused ? 'border-4' : 'border-2'}"
				onfocus={() => (focused = true)}
				onfocusout={() => (focused = false)}
			/>
			<Slider.Tick index={0} />
		</Slider.Root>
	</span>
</div>

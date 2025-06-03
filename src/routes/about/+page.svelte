<div class="relative grid h-screen w-screen justify-center place-items-center p-0 lg:py-20 overflow-auto" >
	<div class="bg-primary/90 shadow-primary w-full lg:max-w-4xl lg:rounded-md shadow-lg p-4 h-fit text-foreground-readable">
		<div class="text-center text-4xl font-bold">About, Probably</div>
		<div class="mt-2">
            <div class="text-xl font-bold">What?</div>
            <p>
                Just a thing that probably will host all or many simulation-like things I create in the coming future,
                assuming that it does not require resources not available to a website to create.
            </p>
            <br />
			<div class="text-xl font-bold">Why?</div>
			<p>
				There was once an idea, as all ideas come. This one idea happened to be interesting, and one
				that seemed perfect to persue. But as all pursuits go, it ended up incomplete, seeming too
				boring to continue forward. The work to reach that ideal end, so easily crafted by the mind
				is much more difficult to achieve in code.
			</p>
			<br />
			<p>
				I've tried to make many simulations over the years, but the sheer amount of boilerplate
				code, and other annoying aspects prevented this from being the sole focus. This implied a
				large amount of work for each small simulation. So, collecting all random simulations and
				the like I make here, will probably allow me to make more interesting simulations that still
				are within my minimal expertise of physics.
			</p>
			<br />
            <div class="text-xl font-bold">When?</div>
            <p>The simulations will be updated whenever I feel like I want to create a new simulation.</p>
            <p>
                This was probably envisioned sometime in mid 2025, and is being produced during June 2025
                if that's what you wanted to know when you read "When?".
            </p>
            <br />
            <div class="text-xl font-bold">Where?</div>
            <p>
                Not all my projects will be here, but as I personally enjoy something about simulations,
                though I don't know what exactly I find interesting in them, there hopefully will be many simulations here 
                in the near future. 
            </p>
            <br />
			<div class="text-xl font-bold">How?</div>
			<div>
                This website uses <a href="https://svelte.dev" class="underline">SvelteKit 5</a>, and 
                <a href="https://tailwindcss.com" class="underline">Tailwindcss 4</a> and is hosted on 
                <a href="https://pages.cloudflare.com" class="underline">Cloudflare Pages</a>.
                There is a global canvas variable that gets updated to point to the most recently created 
                canvas component. Only one main canvas is used for all the rendering. This allows for easy 
                abstraction of all the <pre class="inline">ctx.xyz</pre> calls into seperate functional
                elements for the canvas like <pre class="inline">Text</pre>, <pre class="inline">Path</pre>,
                <pre class="inline">Circle</pre> etc. which can be rendered in a draw loop, which currently just
                provides <pre class="inline">frameTime</pre> as the argument. The sliders and checkboxes are based
                on <a href="https://www.bits-ui.com" class="underline">bits-ui</a> and are used to control variables specific to each 
                simulation, and sveltekit achieves this pretty easily with it's reactivity.
                It's all pretty simple, but the abstraction allows the focus to not be on how to render but on how to 
                create the simulation most effectively.
            </div>
            <br />
            <div class="text-xl font-bold">Keybinds</div>
            <div>
                As promised, here's your list of keyboard shortcuts:
                <ul class="list-disc px-5">
                    <li><pre class="inline font-bold">b</pre>: Go to the home page (route selector) - Available everywhere, try it!</li>
                    <li><pre class="inline font-bold">d</pre>: Open the settings drawer - Available where there's a simulation</li>
                    <li><pre class="inline font-bold">&lt;Space&gt;</pre>: Play and pause simulation - Available where there's a simulation</li>
                </ul>
            </div>
		</div>
	</div>
</div>

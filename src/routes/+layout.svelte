<script lang="ts">
	import { base } from '$app/paths';
	import '../app.css';
</script>

<header class="p-6 container">
	<h1 class="text-4xl">Svelte Sequence Editor</h1>
	<nav class="flex">
		<a href="{base}/examples" class="p-2">Examples</a>
		<a href="{base}/examples/svg" class="p-2">SVG</a>
	</nav>
</header>

<main class="p-6 container">
	<slot />
</main>

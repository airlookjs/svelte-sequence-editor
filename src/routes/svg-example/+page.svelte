<script lang="ts">
	import { Timeline, Layer, Timebar, Block } from '$lib';
	import { quadOut } from 'svelte/easing';
	import { sampleData1, sampleData2 } from '../data';

	import { createTimeline } from '$lib/createTimeline';
</script>

<section class="pb-6">
	<h2 class="text-2xl">Example custom SVG rendering</h2>
	<Timeline
		tag="svg"
		width="100%"
		height="100%"
		options={{ duration: sampleData2.duration }}
		initialData={sampleData2.layers}
		let:layers
	>
		{#if layers}
			{#each layers as layer (layer.key)}
				<Layer tag="g" data={layer} let:block>
					<text slot="header">
						custom header for {layer.key}
					</text>

					<Block {block} slot="blocks" tag="g">
						<rect height="100%" width="10%" fill={'#333'} />
						<text>Custom block</text>
					</Block>
				</Layer>
			{/each}
		{/if}
		<Timebar />
	</Timeline>
</section>

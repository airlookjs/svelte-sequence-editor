<script lang="ts">
    
	import { SequenceLayer, Sequence, SequenceTimebar, SequenceBlock } from '$lib';
	import { createSequence } from '$lib/createSequence';
	import { writable } from 'svelte/store';
	import CustomLayer from './CustomLayer.svelte';

	const PromoterBlockTemplate = {
		key: 'promoter',
		type: 'promoter',

		validations: {
			duration: {
				min: 2000
			}
		}
	};

	// Template for 4 sales
	const template = {
		layers: [
			{
				key: 'video',
                sortIndex: 2,
				blocks: [
					// defaultblocks
					{
						key: 'footage',
						title: 'footage with scene markers',
						inTime: 0,
						outTime: 10000,
                        markers: [
                            {
                                time: 1000,
                                label: 'scene 1'
                            },
                            {
                                time: 1050,
                                label: 'scene 2'
                            },
                            {
                                time: 300,
                                label: 'scene 3'
                            },
                            {
                                time: 4000,
                                label: 'scene 4'
                            },
                            {
                                time: 5000,
                                label: 'scene 5'
                            },
                            {
                                time: 6000,
                                label: 'scene 6'
                            },
                            {
                                time: 7000,
                                label: 'scene 7'
                            },
                            {
                                time: 8000,
                                label: 'scene 8'
                            },
                            {
                                time: 9000,
                                label: 'scene 9'
                            },
                            {
                                time: 10000,
                                label: 'scene 10'
                            }
                        ]
					}
				]
			},
			{
				key: 'promoters',
				blocks: [
					// defaultblocks
					{
						...PromoterBlockTemplate,
						key: 'title',
						layers: [
							{
								key: 'layer1',
								blocks: [
									// defaultblocks
									{
										key: 'block1'
									},
									{
										key: 'block2',
										layers: [
											{
												key: 'layer1',
												blocks: [
													// defaultblocks
													{
														key: 'block1'
													},
													{
														key: 'block2'
													}
												]
											},
											{
												key: 'layer2',
												blocks: [
													// defaultblocks
													{
														key: 'block1'
													},
													{
														key: 'block2'
													}
												]
											}
										]
									}
								]
							}
						]
					}
				]
			}
		]
	};

	// Data from database is flat
	const look = {
		duration: 20000,
		components: [
			{
				type: 'media',
				inTime: 0,
				outTime: 10000,
			},
			{
				type: 'promoter',
				inTime: 0,
				outTime: 10000,
			},
			{
				type: 'promoter',
				inTime: 1000,
				outTime: 4000,
			},
			{
				type: 'promoter',
				inTime: 1000,
				outTime: 4000,
			},
			{
				type: 'promoter',
				inTime: 1000,
				outTime: 4000,
			}
		]
	};



    let framerate = writable(30);
    let time = writable(0);

	const sequence = createSequence({
		initialData: template.layers,
		duration: look.duration
	});

	const { options, duration, getBlockStore } = sequence;

	$: footageblock = getBlockStore('video.footage')!;

	const videoInChangeHandler = (e: Event) => {
		$footageblock.absoluteInTime = (e.target as HTMLInputElement).valueAsNumber;
	};

	const durationChangeHandler = (e: Event) => {
		$duration = (e.target as HTMLInputElement).valueAsNumber;
	};
</script>

<section class="pb-6">
	<h2 class="text-2xl">Scene Detection Markers with snapping</h2>

	<h3>Bind data from a form to the sequence editor</h3>

	<label for="duration">Duration</label>
	<input
		name="duration"
		id="duration"
		type="number"
		value={$duration}
		on:change={durationChangeHandler}
	/>

	<input
		type="number"
		name="videoin"
		value={$footageblock.absoluteInTime}
		on:change={videoInChangeHandler}
	/>

    <h3>Default rendering</h3>
	<Sequence {options} {duration} {sequence} />

    <h3>Custom rendering</h3>
    <Sequence
						sequence={sequence}
						bind:currentTime={$time}
						class="mb-4 w-full dark:border-gray-700 dark:bg-gray-800"
						let:layers
					>

						<SequenceTimebar
                            slot="timebar"
							formatTimeFn={(value) => `${value}`}
							class="dark:bg-gray-900"
						/> 

                        <svelte:fragment slot="layer" let:layer let:index>
                           <CustomLayer data={layer} {index} />
                        </svelte:fragment>

						<!--
							TODO: add sequence markers on its own speacial layer fronm a context that has times of scene changes from the primary video used in the template
							testing in svelte-sequence-editor first then integrating here
							<SequenceMarkers/>
						-->

	    
	</Sequence>

</section>

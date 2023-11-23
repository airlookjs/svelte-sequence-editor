



# Svelte Sequence Editor

UI widget and logic for editing timed sequences in recursively nested structures of layers and blocks. Aimed at simple video and media editing in the browser.

<a href="https://www.npmjs.com/package/@airlookjs/svelte-sequence-editor"><img src="https://img.shields.io/npm/v/@airlookjs/svelte-sequence-editor.svg?style=flat-square&colorB=51C838"
                                                       alt="NPM Version"></a>

## Installation

```bash
$ npm install @airlookjs/svelte-sequence-editor
```

## Usage

```typescript
import { createSequence, Block } from '@airlookjs/svelte-sequence-editor';

const sequenceTemplate = [
    {
		key: 'speak',
		blocks: [
			{
				key: 'audio',
                title: 'Audio',
				inTime: 0,
				outTime: 10000
			}
		]
	},
    {
		key: 'video',
		blocks: [
			{
				key: 'footage',
				title: 'Footage',
				inTime: 0,
				outTime: 10000
            },
				
		]
	},

]

const sequence = createSequence({
			initialData: ,
			duration: 30000,
			options: {
                // Will make the editor snap values to a frame rate of 30 fps
				roundingBase: () => {
					return (1 / 30) * 1000
				},
			    errorHandler: (error) => {
					console.error('sequence editor error', error);
				}
			}
		});
```

## Styling with tailwind
svelte-sequence-editor uses tailwind for styling.

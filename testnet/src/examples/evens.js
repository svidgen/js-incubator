import { asBooleanArray } from '../util.js';
import { Brain } from '../brains/binary.js';

export const BITS = 8;
export const INPUTS = 8;
export const OUTPUTS = 2;

export const TRAINING_LOOPS = 100;
export const LAYERS = 1;

export const TRAINING_DATA = [
	{
		input: asBooleanArray(2, BITS),
		expected: [1, 0]
	},
	{
		input: asBooleanArray(3, BITS),
		expected: [0, 1]
	},
	{
		input: asBooleanArray(104, BITS),
		expected: [1, 0]
	},
	{
		input: asBooleanArray(105, BITS),
		expected: [0, 1]
	},
];

export const brain = new Brain({
	inputs: INPUTS,
	outputs: OUTPUTS,
	layers: LAYERS,
});

export const TEST_CASES = [];

for (let i = 0; i < 255; i++) {
	TEST_CASES.push({
		input: asBooleanArray(i, BITS),
		expected: [
			i % 2 === 0,
			i % 2 === 1
		]
	});
}

export const TEST = {
	matches: (a, b) => JSON.stringify(a) == JSON.stringify(b)
};

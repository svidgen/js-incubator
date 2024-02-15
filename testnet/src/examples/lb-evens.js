import { asIntArray } from '../util.js';
import { Brain } from '../brains/linear.js';

export const BRAIN = Brain;

export const BITS = 8;
export const INPUTS = 8;
export const OUTPUTS = 1;

export const TRAINING_LOOPS = 10000;
export const LAYERS = 2;

export const TRAINING_DATA = [
	{
		input: asIntArray(2, BITS),
		expected: [1]
	},
	{
		input: asIntArray(3, BITS),
		expected: [0]
	},
	{
		input: asIntArray(104, BITS),
		expected: [1]
	},
	{
		input: asIntArray(105, BITS),
		expected: [0]
	},
];

export const TEST_CASES = [];

for (let i = 0; i < 20; i++) {
	TEST_CASES.push({
		input: asIntArray(i, BITS),
		expected: [
			i % 2 === 0 ? 1 : 0,
			// i % 2 === 1 ? 1 : 0,
		]
	});
}

export const TEST = {
	matches: (rawOutput, rawExpected) => {
		const output = rawOutput.map(v => v >= 0.8 ? true : false);
		const expected = rawExpected.map(v => v === 1 ? true : false);
		console.log({rawOutput, rawExpected, output, expected});
		return JSON.stringify(output) == JSON.stringify(expected);
	}
};

import { asIntArray } from '../util.js';
import { Brain } from '../brains/neural-net.js';

export const BITS = 1;
export const TRAINING_LOOPS = 50;

export const brain = new Brain({
	// sigmoid works with no hidden layer
	shape: [
		BITS * 2,
		BITS * 2 * 5,
		BITS * 5
	],

	// Just about every other activation style I've tried has been
	// unable to learn xor. This probably means I'm doing something wrong.
	// But, since this configuration produces a correct net every time I've
	// run it, it can't be *that* wrong ... can it be?
	// It does require about 50 epochs (training loops) to learn the gates with
	// ~100% correctness.
	rate: 0.1,
	activation: x => x > 0.5 ? 1 : 0,
	derivative: x => 1
});

function expected(a, b) {
	return asIntArray(a ^ b, BITS);
}

export const TRAINING_DATA = [
	// or, nor, and, nand, xor
	{ input: [0, 0], expected: [0, 1, 0, 1, 0] },
	{ input: [1, 0], expected: [1, 0, 0, 1, 1] },
	{ input: [0, 1], expected: [1, 0, 0, 1, 1] },
	{ input: [1, 1], expected: [1, 0, 1, 0, 0] },
];
export const TEST_CASES = TRAINING_DATA;

export const TEST = {
	matches: (rawOutput, rawExpected) => {
		const output = rawOutput.map(v => v > 0.5 ? true : false);
		const expected = rawExpected.map(v => v === 1 ? true : false);
		console.log({rawOutput, rawExpected, output, expected});
		return JSON.stringify(output) == JSON.stringify(expected);
	}
};

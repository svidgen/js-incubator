import { asIntArray, fromNumberArray } from '../util.js';
import { Brain } from '../brains/neural-net.js';

export const BITS = 4;
export const MAX_INT = Math.pow(2, BITS);
export const INPUTS = BITS * 2;
export const OUTPUTS = BITS * 2;

export const TRAINING_LOOPS = 10;

export const brain = new Brain({
	shape: [INPUTS, INPUTS * 4, INPUTS * 8, INPUTS * 4, OUTPUTS],
	// activation: x => Math.min(Math.max(0, x), 1)
	// activation: x => 1/(1 + Math.pow(Math.E, -x))
});

export const TRAINING_DATA = [];
for (let i = 0; i < 500; i++) {
	const a = Math.floor(Math.random() * MAX_INT);
	const b = Math.floor(Math.random() * MAX_INT);
	TRAINING_DATA.push({
		input: [...asIntArray(a, BITS), ...asIntArray(b, BITS)],
		expected: [...asIntArray(Number(a) + Number(b), OUTPUTS)]
	});
}

export const TEST_CASES = [];
for (let i = 0; i < 100; i++) {
	const a = Math.floor(Math.random() * MAX_INT);
	const b = Math.floor(Math.random() * MAX_INT);
	TEST_CASES.push({
		input: [...asIntArray(a, BITS), ...asIntArray(b, BITS)],
		expected: [...asIntArray(Number(a) + Number(b), OUTPUTS)]
	});
}

export const TEST = {
	matches: (output, expected) => {
		const outputVal = fromNumberArray(output, 0.8);
		const expectedVal = fromNumberArray(expected, 0.8);
		console.log({output, expected, outputVal, expectedVal});
		return Math.abs(outputVal - expectedVal) < 1;
	}
};

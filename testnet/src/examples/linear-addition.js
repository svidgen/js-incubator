import { asIntArray, fromNumberArray } from '../util.js';
import { Brain } from '../brains/neural-net.js';

export const INPUTS = 2;
export const OUTPUTS = 1;
export const MAX_INT = Math.pow(2, 16);

export const TRAINING_LOOPS = 10;

export const brain = new Brain({
	shape: [INPUTS, OUTPUTS],
	// activation: x => 1 / (1 + Math.pow(Math.E, -x))
	// activation: x => Math.pow(1.05, x)
	activation: x => x
});

export const TRAINING_DATA = [];
for (let i = 0; i < 50; i++) {
	const a = Math.floor(Math.random() * MAX_INT);
	const b = Math.floor(Math.random() * MAX_INT);
	TRAINING_DATA.push({
		input: [a, b],
		expected: [a + b]
	});
}

export const TEST_CASES = [];
for (let i = 0; i < 10; i++) {
	const a = Math.floor(Math.random() * MAX_INT);
	const b = Math.floor(Math.random() * MAX_INT);
	TEST_CASES.push({
		input: [a, b],
		expected: [a + b]
	});
}

export const TEST = {
	matches: (output, expected) => {
		console.log({output, expected});
		return Math.abs(output - expected) < 1;
	}
};

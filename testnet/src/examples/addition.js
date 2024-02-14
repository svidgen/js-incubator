import { asBooleanArray } from '../util.js';
import { Brain } from '../brains/linear.js';

export const BRAIN = Brain;

export const INPUTS = 2;
export const OUTPUTS = 1;

export const TRAINING_LOOPS = 50;
export const LAYERS = 2;

export const TRAINING_DATA = [];
for (let i = 0; i < 20; i++) {
	const a = Math.floor(Math.random() * 100);
	const b = Math.floor(Math.random() * 100);
	TRAINING_DATA.push({
		input: [a, b],
		expected: [Number(a) + Number(b)]
	});
}

export const TEST_CASES = [];
for (let i = 0; i < 100; i++) {
	const a = Math.floor(Math.random() * 100);
	const b = Math.floor(Math.random() * 100);
	TEST_CASES.push({
		input: [a, b],
		expected: [Number(a) + Number(b)]
	});
}

export const TEST = {
	matches: (a, b) => Math.abs(a - b) < 1
};

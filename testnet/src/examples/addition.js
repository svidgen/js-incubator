import { asBooleanArray } from '../util.js';
import { Brain } from '../brains/binary.js';

const BITS = 8;

export const INPUTS = BITS * 2;
export const OUTPUTS = BITS * 2;

export const TRAINING_LOOPS = 50;
export const LAYERS = 3;

export const brain = new Brain({
	inputs: INPUTS,
	outputs: OUTPUTS,
	layers: LAYERS,
});

export const TRAINING_DATA = [];
for (let i = 0; i < 20; i++) {
	const a = Math.floor(Math.random() * 100);
	const b = Math.floor(Math.random() * 100);
	TRAINING_DATA.push({
		input: [...asBooleanArray(a, BITS), ...asBooleanArray(b, BITS)],
		expected: asBooleanArray(Number(a) + Number(b), BITS)
	});
}

export const TEST_CASES = [];
for (let i = 0; i < 100; i++) {
	const a = Math.floor(Math.random() * 100);
	const b = Math.floor(Math.random() * 100);
	TEST_CASES.push({
		input: [...asBooleanArray(a, BITS), ...asBooleanArray(b, BITS)],
		expected: asBooleanArray(Number(a) + Number(b), BITS)
	});
}

export const TEST = {
	matches: (a, b) => Math.abs(a - b) < 1
};

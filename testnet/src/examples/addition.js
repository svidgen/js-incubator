import { asBooleanArray } from '../util.js';

export const BITS = 8;
export const INPUTS = BITS * 2;
export const OUTPUTS = BITS;

export const TRAINING_LOOPS = 50;
export const LAYERS = 4;

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

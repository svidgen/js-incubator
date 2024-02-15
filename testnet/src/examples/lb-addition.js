import { asIntArray, fromNumberArray } from '../util.js';
import { Brain } from '../brains/neural-net.js';

export const BITS = 4;
export const MAX_INT = Math.pow(2, BITS);
export const INPUTS = BITS * 2;
export const OUTPUTS = BITS * 2;

export const TRAINING_LOOPS = 1000;
export const LAYERS = 3;

export const brain = new Brain({
	shape: [INPUTS, INPUTS * 2, OUTPUTS],
	activation: x => Math.min(Math.max(0, x), 1)
});

export const TRAINING_DATA = [];
for (let i = 0; i < 10; i++) {
	const a = Math.floor(Math.random() * MAX_INT);
	const b = Math.floor(Math.random() * MAX_INT);
	TRAINING_DATA.push({
		input: [...asIntArray(a, BITS), ...asIntArray(b, BITS)],
		expected: [...asIntArray(Number(a) + Number(b), BITS)]
	});
}

export const TEST_CASES = [];
for (let i = 0; i < 100; i++) {
	const a = Math.floor(Math.random() * MAX_INT);
	const b = Math.floor(Math.random() * MAX_INT);
	TEST_CASES.push({
		input: [...asIntArray(a, BITS), ...asIntArray(b, BITS)],
		expected: [...asIntArray(Number(a) + Number(b), BITS)]
	});
}

export const TEST = {
	matches: (a, b) => {
		const aVal = fromNumberArray(a, 0.8);
		const bVal = fromNumberArray(b, 0.8);
		console.log({a, b, aVal, bVal});
		return Math.abs(aVal - bVal) < 1;
	}
};

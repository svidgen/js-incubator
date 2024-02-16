import { asIntArray } from '../util.js';
import { Brain } from '../brains/neural-net.js';

export const BITS = 8;
export const TRAINING_LOOPS = 5;

export const brain = new Brain({
	shape: [8, 2],
	// activation: x => x
});

function expected(v) {
	return [
		v % 2 === 0 ? 1 : 0,
		v % 2 === 0 ? 0 : 1,
	];
}

export const TRAINING_DATA = [];
for (let i = 0; i < 10_000; i++) {
	const v = Math.floor(Math.random() * Math.pow(2, BITS) - 1);
	TRAINING_DATA.push({
		input: asIntArray(v, BITS),
		expected: expected(v)
	});
}

// console.log(TRAINING_DATA);

export const TEST_CASES = [];

for (let i = 0; i < Math.pow(2, BITS) - 1; i++) {
	TEST_CASES.push({
		input: asIntArray(i, BITS),
		expected: expected(i)
	});
}

export const TEST = {
	matches: (rawOutput, rawExpected) => {
		const output = rawOutput.map(v => v >= 0.55 ? true : false);
		const expected = rawExpected.map(v => v === 1 ? true : false);
		// console.log({rawOutput, rawExpected, output, expected});
		return JSON.stringify(output) == JSON.stringify(expected);
	}
};

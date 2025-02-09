import { asIntArray } from '../util.js';
import { Brain } from '../brains/neural-net.js';

export const BITS = 5 * 5;
export const TRAINING_LOOPS = 50;

const CHARS = ['a', 'b', 'c', 'd', 'o', '0'];

export const brain = new Brain({
	// sigmoid works with no hidden layer
	shape: [
		// number of bits for input 'image'
		BITS,

		// knowledge layer
		BITS,

		// number of letters we're trying to predict
		CHARS.length
	],

	// Just about every other activation style I've tried has been
	// unable to learn xor. This probably means I'm doing something wrong.
	// But, since this configuration produces a correct net every time I've
	// run it, it can't be *that* wrong ... can it be?
	// It does require about 50 epochs (training loops) to learn the gates with
	// ~100% correctness.
	rate: 0.1,
	// activation: x => x > 0.5 ? 1 : 0,
	activation: x => Math.min(Math.max(x, -1), 1),
	derivative: x => 1
});

function setBitNumber(bitCount, setBitNumber) {
	const bits = new Array(bitCount).fill(0);
	bits[setBitNumber] = 1;
	return bits;
}

function charOutput(c) {
	return setBitNumber(CHARS.length, CHARS.indexOf(c));
}

function drawingAsBytes(txt) {
	return txt
		.split('')
		.filter(c => c ===  '.' || c === '#')
		.map(c => c === '#');
}

export const TRAINING_DATA = [
	// or, nor, and, nand, xor
	{
		input: drawingAsBytes(`
			.###.
			#...#
			#####
			#...#
			#...#
		`),
		expected: charOutput('a'),
	},
	{
		input: drawingAsBytes(`
			.....
			.....
			.##.#
			#..##
			.##.#
		`),
		expected: charOutput('a'),
	},
	{
		input: drawingAsBytes(`
			####.
			#...#
			####.
			#...#
			####.
		`),
		expected: charOutput('b'),
	},
	{
		input: drawingAsBytes(`
			#....
			#....
			####.
			#...#
			####.
		`),
		expected: charOutput('b'),
	},
	{
		input: drawingAsBytes(`
			.###.
			#...#
			#....
			#...#
			.###.
		`),
		expected: charOutput('c'),
	},
	{
		input: drawingAsBytes(`
			.....
			.....
			.####
			#....
			.####
		`),
		expected: charOutput('c'),
	},
	{
		input: drawingAsBytes(`
			####.
			#...#
			#...#
			#...#
			####.
		`),
		expected: charOutput('d'),
	},
	{
		input: drawingAsBytes(`
			....#
			....#
			#####
			#...#
			#####
		`),
		expected: charOutput('d'),
	},
	{
		input: drawingAsBytes(`
			.###.
			#...#
			#...#
			#...#
			.###.
		`),
		expected: charOutput('o')
	},
	{
		input: drawingAsBytes(`
			.....
			.....
			.###.
			#...#
			.###.
		`),
		expected: charOutput('o')
	},
	{
		input: drawingAsBytes(`
			.###.
			#...#
			#.#.#
			#...#
			.###.
		`),
		expected: charOutput('0')
	},
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

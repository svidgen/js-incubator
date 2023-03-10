import { asBooleanArray } from '../util.js';

export const BITS = 8;
export const INPUTS = 8;
export const OUTPUTS = 1;

export const TRAINING_LOOPS = 100;
export const LAYERS = 1;

export const TRAINING_DATA = [
	{
		input: asBooleanArray(2, BITS),
		expected: [1]
	},
	{
		input: asBooleanArray(3, BITS),
		expected: [0]
	},
	{
		input: asBooleanArray(4, BITS),
		expected: [1]
	},
	{
		input: asBooleanArray(5, BITS),
		expected: [0]
	},
	{
		input: asBooleanArray(6, BITS),
		expected: [1]
	},
	{
		input: asBooleanArray(7, BITS),
		expected: [0]
	},
];

export const TEST_CASES = [
	{
		input: asBooleanArray(112, BITS),
		expected: [true]
	},
	{
		input: asBooleanArray(113, BITS),
		expected: [false]
	},
	{
		input: asBooleanArray(114, BITS),
		expected: [true]
	},
	{
		input: asBooleanArray(115, BITS),
		expected: [false]
	},
];

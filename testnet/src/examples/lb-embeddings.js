import fs, {read} from 'fs';
import JSZip from 'jszip';
import { Brain } from '../brains/neural-net.js';

const FILENAME = './data/wiki-qa-corpus.zip';
const URL = "https://download.microsoft.com/download/E/5/F/E5FCFCEE-7005-4814-853D-DAA7C66507E0/WikiQACorpus.zip";

async function download(url, filename) {
	await fs.promises.mkdir('./data', { recursive: true });
	const result = await fetch(url);
	const data = await result.arrayBuffer();
	await fs.promises.writeFile(filename, Buffer.from(data), { encoding: 'binary' });
}

async function readZip(filedata) {
	const files = new Map();
	const zip = new JSZip();
	const contents = await zip.loadAsync(filedata);
	for (const [filename, data] of Object.entries(contents.files)) {
		if (data.dir) continue;
		files.set(filename, await data.async('string'));
	}
	return files;
}

async function getData(tries = 1) {
	if (tries === 0) {
		console.log("Out of retries.");
		exit(1);
	}

	let data;

	try {
		data = await fs.promises.readFile(FILENAME, { encoding: 'binary' });
		console.log("File exists. Reading ...");
	} catch {
		console.log("Data file doesn't exist. Downloading ... ");
		await download(URL, FILENAME);
		return getData(tries - 1);
	}

	console.log("Reading zip ...");
	const files = await readZip(data);
	console.log("Zip loaded.", files.keys());
	return files.get("WikiQACorpus/WikiQA-train.txt");
}

const trainingText = await getData();

console.log('tokenizing');
const tokens = tokenize(trainingText);
console.log('Tokens extracted: ', tokens.length);

console.log('Creating dictionary');
const dictionary = Object.fromEntries(
	[...new Set(tokens)].map((token, idx) => [token, idx])
);
console.log('Dictionary created. Token count: ', dictionary.length);

function tokenize(text) {
	return text.toLowerCase()
		.split(/([^\w])/g)
		.filter(t => t !== ' ' && t !== '')
}

function tokenBits(token) {
	const bits = new Array(BITS).fill(0);
	if (token && dictionary[token]) bits[dictionary[token]] = 1;
	return bits;
}

export const BITS = Object.keys(dictionary).length;

// training will predict the middle word.
export const TRAINING_DATA = function * (count) {
	for (let i = 0; i < count ?? tokens.length; i++) {
		let idx = count ? Math.floor(Math.random() * tokens.length) : i;
		yield {
			input: [
				...tokenBits(tokens[idx - 1]),
				...tokenBits(tokens[idx + 1])
			],
			expected: [
				...tokenBits(tokens[idx]),
			]
		};
	}
}

export const TRAINING_DATA_COUNT = 100;
export const TEST_CASES = TRAINING_DATA;

export const TRAINING_LOOPS = 10;

console.log('Creating brain ... ');
export const brain = new Brain({
	// sigmoid works with no hidden layer
	shape: [
		// number of bits for input 'image'
		BITS * 2,

		// knowledge layer. the number of dimensions we want to assign
		// to each token.
		5,

		// number of letters we're trying to predict
		BITS
	],

	// Just about every other activation style I've tried has been
	// unable to learn xor. This probably means I'm doing something wrong.
	// But, since this configuration produces a correct net every time I've
	// run it, it can't be *that* wrong ... can it be?
	// It does require about 50 epochs (training loops) to learn the gates with
	// ~100% correctness.
	rate: 0.1,
	activation: x => x > 0.5 ? 1 : 0,
	derivative: _x => 1
});
console.log('Brain created');

export const TEST = {
	matches: (rawOutput, rawExpected) => {
		const output = rawOutput.map(v => v > 0.5 ? true : false);
		const expected = rawExpected.map(v => v === 1 ? true : false);
		// console.log({rawOutput, rawExpected, output, expected});
		return JSON.stringify(output) == JSON.stringify(expected);
	}
};

import fs from 'fs';
import JSZip from 'jszip';
import { Brain } from '../brains/sparse-net.js';

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

async function getData(tries = 3) {
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
const dictionary = new Set(tokens);
console.log('Dictionary created. Token count: ', dictionary.size);

function tokenize(text) {
	return text.toLowerCase()
		.split(/([^\w])/g)
		.filter(t => t !== ' ' && t !== '')
}

// training will predict the middle word.
export const TRAINING_DATA = function * (count) {
	for (let i = 0; i < count ?? tokens.length; i++) {
		// let idx = count ? Math.floor(Math.random() * tokens.length) : i;
		const idx = i;
		yield {
			input: [
				tokens[idx - 2] ?? '',
				tokens[idx - 1] ?? '',
				tokens[idx + 1] ?? '',
				tokens[idx + 2] ?? '',
			],
			expected: [
				tokens[idx],
			]
		};
	}
}

export const TRAINING_DATA_COUNT = tokens.length;
export const TEST_CASES = [...TRAINING_DATA(3)];

export const TRAINING_LOOPS = 5;

const DIMENSIONS = Math.floor((Math.log(dictionary.size) / Math.log(2))) + 1;

console.log(`Creating brain with ${DIMENSIONS} dimensions.`);
export const brain = new Brain({
	rate: 0.05,
	activation: x => x > 0.5 ? 1 : 0,
	derivative: _x => 1,
	dimensions: DIMENSIONS,
	positions: 4
});
console.log('Brain created');

export const TEST = {
	matches: (rawOutput, rawExpected) => {
		return 1;
		// const output = rawOutput.map(v => v > 0.5 ? true : false);
		// const expected = rawExpected.map(v => v === 1 ? true : false);
		// console.log({rawOutput, rawExpected, output, expected});
		// return JSON.stringify(output) == JSON.stringify(expected);
	},

	/**
	 * 
	 * @param {Brain} brain 
	 */
	summarize: (brain) => {
		console.log('brain outputs', brain.outputs.size);
		return [
			'man',
			'woman',
			// 'human',
			'person',
			'thing',
			// 'found',
			// 'science'
		].map(w => ({ [w]: brain.getOutput(w).dimensions }));
	}
};

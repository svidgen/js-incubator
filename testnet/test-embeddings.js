import process from 'process';
import fs from 'fs';
import { createInterface } from 'readline/promises';

const readline = createInterface({
	input: process.stdin,
	output: process.stdout,
});

/**
 * 
 * @param {number[]} a 
 * @param {number[]} b 
 * @returns 
 */
function distance(a, b) {
	// euclidian
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        sum += (a[i] - b[i]) ** 2;
    }
    return Math.sqrt(sum);
}

function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magnitudeA += vecA[i] ** 2;
        magnitudeB += vecB[i] ** 2;
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
}


function geography(data, word, limit = 20) {
	const all = Object.entries(data)
		.map(([c, d]) => [c, distance(d, getVectors(data, word)[0])])
		.sort((a, b) => a[1] - b[1])
	;
	return {
		near: Object.fromEntries(all.slice(0, limit)),
		far: Object.fromEntries(all.slice(all.length - limit)),
	}
}

function getVectors(data, ...words) {
	const vectors = [];
	const missing = [];

	for (const word of words) {
		if (!data[word]) {
			missing.push(word);
		} else {
			vectors.push(data[word]);
		}
	}

	if (missing.length > 0) {
		throw new Error(`These words aren't in the dictionary.\n${
			missing.map(w => ` - ${w}`).join('\n')
		}`);
	}

	return vectors;
}

const buildCommands = (data) => ({
	's': (word) => {
		return {
			[word]: {
				// dimensions: data[word],
				...geography(data, word)
			}
		};
	},
	'd': (a, b) => {
		const [vA, vB] = getVectors(data, a, b);
		return distance(vA, vB);
	},
	'c': (a, b) => {
		const [vA, vB] = getVectors(data, a, b);
		return cosineSimilarity(vA, vB);
	}
})

async function getEmbeddings() {
	const filename = process.argv[2];
	console.log(`Attempting to read embeddings from ${filename} ...`);
	const raw = await fs.promises.readFile(filename, { encoding: 'utf8' });
	return JSON.parse(raw);
}

async function prompt() {
	return readline.question("(s WORD | d WORD WORD | c WORD WORD )\n> ");
}

async function main() {
	const data = await getEmbeddings();
	const commands = buildCommands(data);
	let fullCommand = await prompt();
	while (fullCommand) {
		const [command, ...args] = fullCommand.trim().split(/\s+/g);
		if (commands[command]) {
			try {
				console.log(commands[command](...args));
			} catch (error) {
				console.error(`\n${error.message}\n`);
			}
		} else {
			console.log("Bad command. Try again.")
		}
		fullCommand = await prompt();
	}
}

main();
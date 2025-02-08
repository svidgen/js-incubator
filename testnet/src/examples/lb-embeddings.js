import { asIntArray } from '../util.js';
import { Brain } from '../brains/neural-net.js';

const trainingText = `
It isn't easy when a dot-com as reputable and beloved as the one and only pointless dot-com falls short of its dedicated patrons' expecations. And indeed, we have fallen short. As you can plainly see, our last public update was a whopping eight months ago when we promised semi-fungible red dot tokens. "And where are they?" you ask.

And boy, are you ever right to ask. But boy, do we ever have some answer.

You see, it all started six months ago. We had millions of these virtual red dots just laying around, awaiting token fungitization. And we said, "Hey, let's fungitize these dots." But see, that's where things got hairy — really, literally hairy.

For reasons unbeknownst to me, the dots started sprouting beard hairs. You can't even make this stuff up. They grew giant beards, formed a biker gang, and literally rode off. Red dots, which you normally expect to be doing literally nothing (at least around here), grew beards, and rode into the freaking sunset.

It was majestic. It was a little scary. And in the end, it's actually pretty infuriating. We had big plans for these dots, their tokenization, their fungitization, etc.. They were going to be famous. And now where are they?

Freaking sunset. On motorcycles. Beards and everything.

So, that's what we're up against here. Sure, there are still some dots around. But, not as many — what with all the dots in the sunset now with their beards. But, rest assured, we haven't forgotten about our promise. If push comes to shove, we'll see about coaxing them back with some sweet new rides or something. Or perhaps beard trimmers.

In the meantime, sit tight. We'll get those fungible red dot tokens. We're just dealing with quite a lot of unexpected drama at the moment.

Thanks for your patience.
`;

// const shortTraining = 'this is a short text. the text is short. it is not long. but instead short.';
// const tokens = tokenize(shortTraining);

const tokens = tokenize(trainingText);

const dictionary = Object.fromEntries(
	[...new Set(tokens)].map((token, idx) => [token, idx])
);

function tokenize(text) {
	return text.toLowerCase()
		.split(/([^\w])/g)
		.filter(t => t !== ' ' && t !== '')
}

function tokenBits(token) {
	const bits = new Array(BITS).fill(0);
	bits[dictionary[token]] = 1;
	return bits;
}

export const BITS = Object.keys(dictionary).length;

// training will predict the middle word.
export const TRAINING_DATA = tokens
	.slice(1, tokens.length - 2)
	.map((_, idx) => {
		return {
			input: [
				...tokenBits(tokens[idx - 1]),
				...tokenBits(tokens[idx + 1])
			],
			expected: tokenBits(tokens[idx]),
		};
	});

export const TEST_CASES = TRAINING_DATA;

export const TRAINING_LOOPS = 20;

export const brain = new Brain({
	// sigmoid works with no hidden layer
	shape: [
		// number of bits for input 'image'
		BITS * 2,

		// knowledge layer. the number of dimensions we want to assign
		// to each token.
		16,

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

export const TEST = {
	matches: (rawOutput, rawExpected) => {
		const output = rawOutput.map(v => v > 0.5 ? true : false);
		const expected = rawExpected.map(v => v === 1 ? true : false);
		// console.log({rawOutput, rawExpected, output, expected});
		return JSON.stringify(output) == JSON.stringify(expected);
	}
};

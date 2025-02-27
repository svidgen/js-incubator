import process from 'process';
import { dF } from '../util.js';

const sum = values => {
	let rv = 0;
	for (const v of values) rv += v;
	return rv;
};

const bound = (value, lower, upper) => Math.max(Math.min(value, upper), lower);

class Input {
	/**
	 * @type {number[][]}
	 */
	dimensions = [];
	rate = 0.05;
	activation;
	dF;

	constructor({ activation, derivative, dimensions, rate }) {
		this.activation = activation;
		this.dF = derivative || dF(activation);
		this.dimensions = Array(dimensions);
		for (let i = 0; i < dimensions; i++) {
			this.dimensions[i] = Math.random() * 2 - 1;
		}
		this.rate = rate || 0.05;
	}

	toJSON() {
		return {
			dimensions: this.dimensions,
		};
	}

	/**
	 * @param {number[]} error
	 */
	learn(error) {
		for (let i = 0; i < error.length; i++) {
			const correction = this.rate * error[i] * this.dF(1);
			const newValue = bound(this.dimensions[i] + correction, -1, 1);
			this.dimensions[i] = newValue;
		}
	}
}

class Output {
	dimensions = [];
	output = 0;
	activation = x => x;
	dF = x => 1;
	rate = 0.05;

	constructor({ dimensions, activation, derivative, rate }) {
		this.dimensions = Array(dimensions);
		for (let i = 0; i < this.dimensions.length; i++) {
			this.dimensions[i] = Math.random() * 2 - 1;
		}
		if (activation) this.activation = activation;
		this.dF = derivative || dF(activation);
		this.rate = rate || 0.05;
	}

	toJSON() {
		return {
			dimensions: this.dimensions,
			activation: this.activation.toString()
		};
	}

	weighted() {
		return this.dimensions.map((w, i) => w * this.inputs[i]);
	}

	think(inputs) {
		this.inputs = inputs;
		this.z = sum(this.weighted());
		this.output = this.activation(this.z);
		return this.output;
	}

	derivative() {
		return this.dF(this.z);
	}

	learn(error) {
		const inputErrors = this.inputs.map(
			(_, i) => error * this.derivative() * this.dimensions[i]
		);

		for (let i = 0; i < this.dimensions.length; i++) {
			const correction = this.rate * error * this.derivative() * this.inputs[i];
			const newDim = bound(this.dimensions[i] + correction, -1, 1);
			this.dimensions[i] = newDim;
		}
		
		return inputErrors;
	}
}

export class Brain {
	/**
	 * @type {Map<string | symbol, Input>}
	 */
	inputs = new Map();

	/**
	 * @type {Map<string | symbol, Output>}
	 */
	outputs = new Map();

	/**
	 * @type {string[]}
	 */
	outputQueue = [];

	activation;
	derivation;
	rate;
	dimensions;
	lastNegativeSample = -1;
	dF = x => 1;

	constructor({
		activation = x => 1/(1 + (Math.pow(Math.E, -x))),
		derivative,
		rate = 0.1,
		dimensions = 5,
	}) {
		this.activation = activation;
		this.rate = rate;
		this.dimensions = dimensions;
		this.dF = derivative || dF(activation);
	}

	/**
	 * 
	 * @param {Output} exluding 
	 */
	negativeSample(excluding) {
		/**
		 * @type {Output[]}
		 */
		const samples = [];
		const sampleSize = Math.floor(Math.log(this.outputQueue.length) + 1);
		for (let i = 0; i < sampleSize; i++) {
			this.lastNegativeSample = (this.lastNegativeSample + 1) % this.outputQueue.length;
			const sampleKey = this.outputQueue[this.lastNegativeSample];
			const sample = this.outputs.get(sampleKey);
			if (sample && sample !== excluding) {
				samples.push(sample);
			}
		}
		
		return samples;
	}

	/**
	 * @param {string | symbol} key
	 * @returns {Input}
	 */
	getInput(key) {
		let input = this.inputs.get(key);
		if (!input) {
			input = new Input({
				activation: this.activation,
				derivative: this.dF,
				dimensions: this.dimensions,
				rate: this.rate,
			});
			this.inputs.set(key, input);
		}
		return input;
	}

	/**
	 * @param {string | symbol} key
	 * @returns {Output}
	 */
	getOutput(key) {
		// console.log('getting output', key);
		let output = this.outputs.get(key);
		if (!output) {
			output = new Output({
				activation: this.activation,
				derivative: this.dF,
				dimensions: this.dimensions,
				rate: this.rate,
			});
			this.outputs.set(key, output);
			this.outputQueue.push(key);
		}
		return output;
	}

	/**
	 * @param {{
	 * 	input: (string | symbol)[],
	 * 	expected: (string | symbol)
	 * } association
	 */
	learn(association) {
		const inputs = association.input.map(t => this.getInput(t));
		const expected = this.getOutput(association.expected[0]);
		const negativeSample = this.negativeSample(expected);

		let dimensions = Array(this.dimensions).fill(0);
		for (let d = 0; d < this.dimensions; d++) {
			for (const input of inputs) {
				dimensions[d] += input.dimensions[d];
			}
			dimensions[d] = this.activation(dimensions[d]);
		}

		const output = expected.think(dimensions);

		// expected/desired output is always 1 (100%). so, base error is simply
		// 1 minus the current output.
		const errors = expected.learn(1 - output);

		// console.log('\n\n\n############')
		// console.dir({ inputs, expected, output, dimensions, errors }, { depth: null });

		// we also take a negative sample of neurons to learn 0% for these dimensions
		// and to backpropagate. if we don't do this, every input will simply
		// predict every output eventually.
		
		for (const negative of negativeSample) {
			const negativeOutput = negative.think(dimensions);
			const nerrors = negative.learn(0 - negativeOutput);
			for (const [i, nerror] of nerrors.entries()) {
				errors[i] = errors[i] + nerror;
			}
			// console.dir({ negative, negativeOutput, nerrors }, { depth: null });
		}

		// console.dir({ errors }, { depth: null });

		// there is only one "layer" -- the virtual layer of dimensions.
		// and, we've baked learning into the inputs.
		for (const [p, input] of inputs.entries()) {
			input.learn(p, errors);
		}

		// console.dir({ inputs }, { depth: null });
		// console.log('############\n\n\n');
		// if (this.lastNegativeSample > 5) process.exit();

	}

	/**
	 * @param {(string | symbol)[]} inputTokens
	 * @returns {string | symbol}
	 */
	think(inputTokens) {
		// naive for now. maybe n-dimensionally indexed later.
		
		const inputs = inputTokens.map(t => this.getInput(t));

		let dimensions = Array(this.dimensions).fill(0);
		for (const input of inputs) {
			for (let d = 0; d < this.dimensions; d++) {
				dimensions[d] += input.dimensions[d];
			}
		}
		// console.log('pre activate dims', dimensions);
		dimensions = dimensions.map(d => this.activation(d));

		/**
		 * @type {({ token: string | symbol, confidence: number })[]}
		 */
		const results = [];

		for (const [token, candidate] of this.outputs.entries()) {
			const output = candidate.think(dimensions);
			// if (output > 0.5) {
				results.push({
					confidence: output,
					token
				});
			// }
		}

		results.sort((a, b) => {
			return a.confidence - b.confidence;
		}).reverse();

		const topN = results.slice(0, 100);

		// const glacier = results.filter(r => r.token === 'glacier');

		// console.log(JSON.stringify({ dimensions, inputTokens, topN, glacier }, null, 2))

		return topN;
	}

	toJSON() {
		return {
			outputs: this.outputs
		};
	}
}

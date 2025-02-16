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
	positions = [];
	rate = 0.01;

	constructor({ positions, dimensions, rate }) {
		this.positions = Array(positions);
		for (let p = 0; p < positions; p++) {
			this.positions[p] = Array(dimensions);
			for (let d = 0; d < dimensions; d++) {
				this.positions[p][d] = Math.random() * 2 - 1;
			}
		}
		this.rate = rate || 0.01;
	}

	toJSON() {
		return {
			positions: this.positions,
		};
	}

	/**
	 * @param {number} position 
	 * @param {number[]} error
	 */
	learn(position, error) {
		for (let i = 0; i < error.length; i++) {
			const correction = this.rate * error[i];
			const newValue = bound(this.positions[position][i] + correction, -1, 1);
			this.positions[position][i] = newValue;
		}
	}
}

class Output {
	dimensions = [];
	output = 0;
	bias = 0;
	activation = x => x;
	dF = x => 1;
	rate = 0.01;

	constructor({ dimensions, activation, derivative, rate }) {
		this.dimensions = Array(dimensions);
		for (let i = 0; i < this.dimensions.length; i++) {
			this.dimensions[i] = Math.random() * 2 - 1;
		}
		if (activation) this.activation = activation;
		this.dF = derivative || dF(activation);
		this.rate = rate || 0.01;
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
		this.z = sum(this.weighted()) + this.bias;
		this.output = this.activation(this.z);
		return this.output;
	}

	derivative() {
		return this.dF(this.z);
	}

	learn(error) {
		const perInputError = error / (this.inputs.length + 1);

		const inputErrors = this.inputs.map(
			(_, i) => error * this.derivative() * this.dimensions[i]
		);

		const biasCorrection = this.rate * perInputError * this.derivative();
		const newBias = bound(this.bias + biasCorrection, -1, 1);
		this.bias = newBias;

		for (let i = 0; i < this.dimensions.length; i++) {
			let slope = this.derivative() * this.inputs[i];
			if (slope === 0) continue;
			const correction = this.rate * error * slope;
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

	activation;
	derivation;
	rate;
	dimensions;
	positions;

	constructor({
		activation = x => 1/(1 + (Math.pow(Math.E, -x))),
		derivative,
		rate = 0.1,
		dimensions = 5,
		positions = 4,
	}) {
		this.activation = activation;
		this.dervative = derivative;
		this.rate = rate;
		this.dimensions = dimensions;
		this.positions = positions;
	}

	/**
	 * @param {string | symbol} key
	 * @returns {Input}
	 */
	getInput(key) {
		let input = this.inputs.get(key);
		if (!input) {
			input = new Input({
				dimensions: this.dimensions,
				positions: this.positions,
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
		let output = this.outputs.get(key);
		if (!output) {
			output = new Output({
				activation: this.activation,
				derivative: this.dervative,
				dimensions: this.dimensions,
				rate: this.rate,
			});
			this.outputs.set(key, output);
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
		const expected = this.getOutput(association.expected);

		let dimensions = Array(this.dimensions).fill(0);
		for (const [p, input] of inputs.entries()) {
			for (let d = 0; d < this.dimensions; d++) {
				dimensions[d] += input.positions[p][d];
			}
		}

		const output = expected.think(dimensions);

		// expected/desired output is always 1 (100%). so, base error is simply
		// 1 minus the current output.
		const errors = expected.learn(1 - output);

		// there is only one "layer" -- the virtual layer of dimensions.
		// and, we've baked learning into the inputs.
		for (const [p, input] of inputs.entries()) {
			input.learn(p, errors);
		}
	}

	/**
	 * @param {(string | symbol)[]} inputTokens
	 * @returns {string | symbol}
	 */
	think(inputTokens) {
		// naive for now. maybe n-dimensionally indexed later.
		
		const inputs = inputTokens.map(t => this.getInput(t));

		let dimensions = Array(this.dimensions).fill(0);
		for (const [p, input] of inputs.entries()) {
			for (let d = 0; d < this.dimensions; d++) {
				dimensions[d] += input.positions[p][d];
			}
		}

		/**
		 * @type {({ token: string | symbol, confidence: number })[]}
		 */
		const results = [];

		for (const [token, candidate] of this.outputs.entries()) {
			const output = candidate.think(dimensions);
			if (output > 0.5) {
				results.push({
					confidence: output,
					token
				});
			}
		}

		results.sort((a, b) => {
			return a.confidence - b.confidence;
		}).reverse();

		return results.slice(0, 10);
	}

	toJSON() {
		return {
			outputs: this.outputs
		}
	}
}

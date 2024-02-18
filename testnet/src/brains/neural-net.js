import { dF } from '../util.js';

// const BIAS = ();
const LEARN_RATE = 0.01;

const sum = values => {
	let rv = 0;
	for (const v of values) rv += v;
	return rv;
};

const bound = (value, lower, upper) => Math.max(Math.min(value, upper), lower);

const weighted = (values, weights) => weights.map((w, i) => w * (values[i] || 0));

class Neuron {
	weights = [];
	inputs = [];
	z = 0;
	output = 0;
	bias = 0;
	activation = x => x;
	dF = x => 1;

	constructor({inputs, activation, derivative}) {
		for (let i = 0; i < inputs.length; i++) {
			this.weights[i] = Math.random() * 2 - 1;
		}
		if (activation) this.activation = activation;
		this.dF = derivative || dF(activation);
		this.bias = Math.random() * 2 - 1;
	}

	toJSON() {
		return {
			weights: this.weights,
			bias: this.bias,
			activation: this.activation.toString()
		};
	}

	weighted(inputs) {
		return this.weights.map((w, i) => w * this.inputs[i]);
	}

	think(inputs) {
		this.inputs = inputs;
		this.z = sum(this.weighted(inputs)) + this.bias;
		this.output = this.activation(this.z);
		return this.output;
	}

	derivative() {
		return this.dF(this.z);
	}

	learn(error) {
		// console.log('neuron correcting for error', error);
		const perInputError = error / (this.inputs.length + 1);
		const inputErrors = this.inputs.map(
			(v, i) => error * this.derivative() * this.weights[i]
		);

		const biasCorrection = LEARN_RATE * perInputError / this.derivative();
		const newBias = bound(this.bias + biasCorrection, -1, 1);

		if (isNaN(newBias)) {
			console.log({
				inputs: this.inputs,
				weights: this.weights,
				z: this.z,
				output: this.output,
				error,
				inputErrors,
				bias: this.bias,
				newBias,
				derivative: this.derivative(),
				dF: this.dF.toString(),
				biasCorrection,
			});
			throw new Error('bad bias update');
		}
		this.bias = newBias;

		for (let i = 0; i < this.weights.length; i++) {
			let slope = this.derivative() * this.inputs[i];
			if (slope === 0) continue;
			// const correction = LEARN_RATE * inputErrors[i] / slope;
			const correction = LEARN_RATE * perInputError / slope;
			const newWeight = bound(this.weights[i] + correction, -1, 1);
			if (isNaN(newWeight) || false) {
				console.log({
					input: this.inputs[i],
					z: this.z,
					bias: this.bias,
					derivative: this.derivative(),
					dF: this.dF.toString(),
					slope,
					correction,
					weight: this.weights[i],
					newWeight,
				});
				// throw new Error("Bad training!");
			}
			this.weights[i] = newWeight;
		}
		// console.log('neuron returning backprop errors', inputErrors);
		return inputErrors;
	}
}

export class Brain {
	layers = [];
	inputs;

	constructor({
		shape = [8, 8, 8],
		activation = x => 1/(1 + (Math.pow(Math.E, -x)))
	}) {
		this.inputs = shape[0];
		for (let layer_i = 1; layer_i < shape.length; layer_i++) {
			const neurons = shape[layer_i];
			const layer = [];
			for (let output_i = 0; output_i < neurons; output_i++) {
				layer.push(new Neuron({
					inputs: this.layers[this.layers.length - 1] || Array(shape[0]),
					activation
				}));
			}
			this.layers.push(layer);
		}
	}

	get inputs() {
		return this.layers[0];
	}

	get outputs() {
		return this.layers[this.layers.length - 1];
	}

	learn({input, expected}) {
		let output = this.think(input);
		// console.log('brain learn', {input, expected, output});
		let errors = expected.map((e, i) => e - output[i]);
		for (const layer of [...this.layers].reverse()) {
			// console.log(JSON.stringify({errors, layer}, null, 2));
			const newErrors = [];
			for (const [i, neuron] of layer.entries()) {
				if (!Number.isFinite(errors[i])) {
					console.log('bad error', {
						output, input, expected,
						neuron, i
					});
					throw new Error('wtf');
					continue;
				}
				const neuronErrors = neuron.learn(errors[i]);
				for (const [error_i, error] of neuronErrors.entries()) {
					newErrors[error_i] = (newErrors[error_i] || 0) + error;
				}
			}
			errors = newErrors;
			// console.log('errors to backpropagate', errors);
		}
	}

	think(input) {
		let data = input;
		// console.log('brain think', {input: data});
		for (const layer of this.layers) {
			const newData = layer.map(n => n.think(data));
			data = newData;
			// console.log('data from layer', {data});
		}
		// console.log('brain done thinking');
		return data;
	}
}

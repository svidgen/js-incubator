import { dF } from '../util.js';

const sum = values => {
	let rv = 0;
	for (const v of values) rv += v;
	return rv;
};

const bound = (value, lower, upper) => Math.max(Math.min(value, upper), lower);

class Neuron {
	weights = [];
	inputs = [];
	z = 0;
	output = 0;
	bias = 0;
	activation = x => x;
	dF = x => 1;
	rate = 0.01;

	constructor({ inputs, activation, derivative, rate }) {
		for (let i = 0; i < inputs.length; i++) {
			this.weights[i] = Math.random() * 2 - 1;
		}
		if (activation) this.activation = activation;
		this.dF = derivative || dF(activation);
		this.bias = Math.random() * 2 - 1;
		this.rate = rate || 0.01;
	}

	toJSON() {
		return {
			weights: this.weights,
			bias: this.bias,
			activation: this.activation.toString()
		};
	}

	weighted() {
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
		const perInputError = error / (this.inputs.length + 1);
		const inputErrors = this.inputs.map(
			(v, i) => error * this.derivative() * this.weights[i]
		);

		const biasCorrection = this.rate * perInputError * this.derivative();
		const newBias = bound(this.bias + biasCorrection, -1, 1);
		this.bias = newBias;

		for (let i = 0; i < this.weights.length; i++) {
			let slope = this.derivative() * this.inputs[i];
			if (slope === 0) continue;
			const correction = this.rate * error * slope;
			const newWeight = bound(this.weights[i] + correction, -1, 1);
			this.weights[i] = newWeight;
		}
		return inputErrors;
	}
}

export class Brain {
	layers = [];
	inputs;

	constructor({
		shape = [8, 8, 8],
		activation = x => 1/(1 + (Math.pow(Math.E, -x))),
		derivative,
		rate = 0.1
	}) {
		this.inputs = shape[0];
		for (let layer_i = 1; layer_i < shape.length; layer_i++) {
			const neurons = shape[layer_i];
			const layer = [];
			for (let output_i = 0; output_i < neurons; output_i++) {
				layer.push(new Neuron({
					inputs: this.layers[this.layers.length - 1] || Array(shape[0]),
					activation,
					derivative,
					rate
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

	learn({ input, expected }) {
		let output = this.think(input);
		let errors = expected.map((e, i) => e - output[i]);
		for (const layer of [...this.layers].reverse()) {
			const newErrors = [];
			for (const [i, neuron] of layer.entries()) {
				const neuronErrors = neuron.learn(errors[i]);
				for (const [error_i, error] of neuronErrors.entries()) {
					newErrors[error_i] = (newErrors[error_i] || 0) + error;
				}
			}
			errors = newErrors;
		}
	}

	think(input) {
		let data = input;
		for (const layer of this.layers) {
			const newData = layer.map(n => n.think(data));
			data = newData;
		}
		return data;
	}
}

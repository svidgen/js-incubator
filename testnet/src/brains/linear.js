const LINEAR = x => x;
const D_LINEAR = x => 1;
const BIAS = 0;
const LEARN_RATE = 0.01;

const sum = values => {
	let rv = 0;
	for (const v of values) rv += v;
	return rv;
};

const weighted = (values, weights) => weights.map((w, i) => w * (values[i] || 0));

class Neuron {
	weights = [];
	inputs = [];
	bias = BIAS;
	activation = LINEAR;
	derivative = D_LINEAR;

	constructor({inputs}) {
		for (let i = 0; i < inputs.length; i++) {
			this.weights[i] = Math.random() - 0.5;
		}
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
		return this.activation(sum(this.weighted(inputs))) + this.bias;
	}

	learn(error) {
		// console.log('neuron correcting for error', error);
		const inputErrors = [];
		for (let i = 0; i < this.weights.length; i++) {
			inputErrors[i] =
				error * this.derivative(this.weights[i]) * this.inputs[i];
			this.weights[i] = this.weights[i] + LEARN_RATE * inputErrors[i];
			if (isNaN(this.weights[i])) {
				console.log({
					error,
					inputErrors,
					weights: this.weights,
					inputs: this.inputs
				});
				throw new Error("Bad training!");
			}
		}
		// console.log('neuron returning backprop errors', inputErrors);
		return inputErrors;
	}
}

export class Brain {
	layers = [];
	inputs;

	constructor({inputs = 1, outputs = 1, layers = 1}) {
		this.inputs = inputs;
		for (let layer_i = 0; layer_i < layers; layer_i++) {
			const isFinal = layer_i === layers - 1;
			const neurons = isFinal ? outputs : inputs;
			const layer = [];
			for (let output_i = 0; output_i < neurons; output_i++) {
				layer.push(new Neuron({
					inputs: this.layers[this.layers.length - 1] || Array(inputs)
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
		console.log('brain learn', {input, expected});
		let output = this.think(input);
		let errors = expected.map((e, i) => e - output[i]);
		for (const layer of [...this.layers].reverse()) {
			// console.log(JSON.stringify({errors, layer}, null, 2));
			const newErrors = [];
			for (const [i, neuron] of layer.entries()) {
				// if (errors[i] === undefined || errors[i] === null) continue;
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
		console.log('brain think', {input: data});
		for (const layer of this.layers) {
			const newData = layer.map(n => n.think(data));
			data = newData;
			// console.log('data from layer', {data});
		}
		console.log('brain done thinking');
		return data;
	}
}

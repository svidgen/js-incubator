const LINEAR = x => x;
const D_LINEAR = x => 1;
const BIAS = 1;
const LEARN_RATE = 0.01;

const sum = values => {
	let rv = 0;
	for (const v of values) rv += v;
	return rv;
};

const weighted = (values, weights) => values.map((v, i) => v * weights[i]);

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
		return this.weights.map((w, i) => w * (this.inputs[i] || 0));
	}

	think(inputs) {
		this.inputs = inputs;
		return this.activation(sum(this.weighted(inputs))) + this.bias;
	}

	learn(error) {
		const errors = [];
		for (let i = 0; i < this.weights.length; i++) {
			errors[i] = this.derivative(this.weights[i]) * (this.inputs[i] || 0);
			this.weights[i] = this.weights[i] - errors[i];
			if (isNaN(this.weights[i])) {
				console.log({errors, weights: this.weights, inputs: this.inputs});
				throw new Error("Bad training!");
			}
		}
		return errors;
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
		let output = this.think(input);
		let errors = expected.map((e, i) => e - output[i]);
		for (const layer of this.layers.reverse()) {
			let newErrors = [];
			for (const [i, neuron] of layer.entries()) {
				const neuronErrors = neuron.learn(errors[i]);
				newErrors[i] = (newErrors[i] || 0) + neuronErrors[i];
			}
			errors = newErrors;
		}
	}

	think(input) {
		let data = input;
		console.log({input: data});
		for (const layer of this.layers) {
			data = layer.map(n => n.think(data));
			console.log({data});
		}
		return data;
	}
}

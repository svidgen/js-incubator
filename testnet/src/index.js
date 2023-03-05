
const SIGMOID = v => 1/(1 + Math.pow(Math.E, -v));
const SIGMOID_THRESHOLD = v => 1/(1 + Math.pow(Math.E, -v)) > 0.5;
const BIAS = 1;
const LEARN_RATE = 0.8;

const sum = values => {
	let rv = 0;
	for (const v of values) rv += v;
	return rv;
};

const weighted = (values, weights) => values.map((v, i) => v * weights[i]);

class Neuron {
	inputs = [];
	weights = [];
	bias = BIAS;
	activation = SIGMOID;

	constructor({inputs}) {
		this.inputs = inputs;
		this.weights = this.inputs.map(() => Math.random());
	}

	get output() {
		return this.activation(
			this.bias * sum(weighted(
				this.inputs.map(i => i.output),
				this.weights
			))
		);
	}

	learn(target) {
		const error = target - this.output;

		for (let i = 0; i < this.inputs.length; i++) {
			this.inputs[i].learn?.(
				(1 - LEARN_RATE) * error * this.inputs[i].output
			);

			this.weights[i] = this.weights[i] * LEARN_RATE * error;
		}
	}
}

class Input {
	output;
}

class Brain {
	layers = [];

	constructor({inputs = 1, outputs = 1, layers = 1}) {
		const inputLayer = [];
		for (let input_i = 0; input_i < inputs; input_i++) {
			inputLayer.push(new Input());
		}
		this.layers.push(inputLayer);

		for (let layer_i = 0; layer_i < layers; layer_i++) {
			const layer = [];
			for (let output_i = 0; output_i < outputs; output_i++) {
				layer.push(new Neuron({
					inputs: this.layers[this.layers.length - 1]
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
		for (let i = 0; i < this.inputs.length; i++) {
			this.inputs[i].output = input[i];
		}

		for (let i = 0; i < this.outputs.length; i++) {
			this.outputs[i].learn(expected[i]);
		}
	}

	think(input) {
		for (let i = 0; i < this.inputs.length; i++) {
			this.inputs[i].output = input[i];
		}
		return this.outputs.map(o => o.output);
	}
}

class App {
	run() {
		const brain = new Brain({inputs: 1, outputs: 1, layers: 5});
		for (let i = 0; i < 50; i++) {
			brain.learn({input: [1], expected: [1]});
			brain.learn({input: [2], expected: [4]});
			brain.learn({input: [3], expected: [6]});
			brain.learn({input: [4], expected: [8]});
		}
		console.log({brain});
		console.log(brain.think([5]));
	}
}

export default App;

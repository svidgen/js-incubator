const SIGMOID = v => 1/(1 + Math.pow(Math.E, -v));
const SIGMOID_THRESHOLD = v => 1/(1 + Math.pow(Math.E, -v)) > 0.5;
const THRESHOLD = v => v > 0;
const BIAS = 1;
const LEARN_RATE = 0.05;

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
	activation = THRESHOLD;

	constructor({inputs}) {
		this.inputs = inputs;
		this.weights = this.inputs.map(() => Math.random() - 0.5);
		// this.weights = this.inputs.map(() => 0);
	}

	toJSON() {
		return {
			weights: this.weights,
			bias: this.bias,
			activation: this.activation.toString()
		};
	}

	get output() {
		return this.activation(
			this.bias * sum(weighted(
				this.inputs.map(i => i.output ? 1 : -1),
				this.weights
			))
		);
	}

	learn(target) {
		// console.log({target, output: this.output});
		for (let i = 0; i < this.inputs.length; i++) {
			if (this.inputs[i].output === !!target) {
				this.weights[i] = this.weights[i] + LEARN_RATE;
			} else {
				this.weights[i] = this.weights[i] - LEARN_RATE;
			}
			this.inputs[i].learn?.(target);
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
			const isFinal = layer_i === layers - 1;
			const neurons = isFinal ? outputs : inputs;
			const layer = [];
			for (let output_i = 0; output_i < neurons; output_i++) {
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
	async run(name = 'evens') {
		const {
			INPUTS,
			OUTPUTS,
			TRAINING_LOOPS,
			TRAINING_DATA,
			LAYERS,
			TEST_CASES
		} = await import(`./examples/${name}.js`);

		const brain = new Brain({
			inputs: INPUTS, outputs: OUTPUTS, layers: LAYERS
		});
		for (let i = 0; i < TRAINING_LOOPS; i++) {
			process.stdout.write(`\rtraining loop ${i}`);
			for (const {input, expected} of TRAINING_DATA) {
				brain.learn({input, expected});
			}
		}
		console.log();
		console.log(JSON.stringify({brain}, null, 2));

		let matches = 0;
		let count = 0;
		for (const {input, expected} of TEST_CASES) {
			process.stdout.write(`\rchecking test case ${count}`);
			const output = brain.think(input);
		 	// console.log({input, output, expected});
			if (JSON.stringify(output) == JSON.stringify(expected)) {
				matches += 1;
			}
			count++;
		}
		console.log();
		console.log('success rate', matches / count);
	}
}

export default App;

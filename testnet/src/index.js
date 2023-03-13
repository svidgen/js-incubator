class App {
	async run(name = 'evens', brainOverride = undefined) {
		const {
			BRAIN,
			INPUTS,
			OUTPUTS,
			TRAINING_LOOPS,
			TRAINING_DATA,
			LAYERS,
			TEST_CASES
		} = await import(`./examples/${name}.js`);

		const Brain = brainOverride ?
			await import(`./src/brains/${brain}.js`) :
			BRAIN
		;

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

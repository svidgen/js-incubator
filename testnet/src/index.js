function formatPercent(decimal, bar = 25, digits = 6) {
	const barBuffer = [
		...[...Array(bar)].map(c => '='),
		...[...Array(bar)].map(c => ' '),
	].join('');
	const barBufferIndex = Math.round(bar * (1 - decimal));
	const fill = barBuffer.substring(barBufferIndex, barBufferIndex + bar);
	const pct = `          ${(decimal * 100).toFixed(digits - 5)}%`;
	return `[${fill}] ${pct.substring(pct.length - digits)}`;
}

// because training data could be a generator
function * entries(data) {
	let i = 0;
	for (const item of data) {
		yield [i, item];
		i++;
	}
}

class App {
	async run(name = 'evens', brainOverride = undefined) {
		const {
			brain,
			TRAINING_LOOPS,
			TRAINING_DATA,
			TRAINING_DATA_COUNT,
			TEST_CASES,
			TEST,
		} = await import(`./examples/${name}.js`);

		const updateInterval = 100; // in ms
		let lastUpdate;

		for (let epoch = 0; epoch < TRAINING_LOOPS; epoch++) {
			const trainingData = typeof TRAINING_DATA === 'function'
				? TRAINING_DATA(TRAINING_DATA_COUNT)
				: TRAINING_DATA;

			const dataLength = typeof TRAINING_DATA === 'function'
				? TRAINING_DATA_COUNT
				: TRAINING_DATA.length;

			process.stdout.write(`epoch ${epoch + 1} of ${TRAINING_LOOPS}`);
			for (const [i, {input, expected}] of entries(trainingData)) {
				const now = new Date().getTime()
				if (!lastUpdate || now - lastUpdate > updateInterval) {
					lastUpdate = now;
					const pct = formatPercent(i/dataLength);
					process.stdout.write(
						`\repoch ${epoch + 1} of ${TRAINING_LOOPS} ${pct}`
					);
				}
				brain.learn({input, expected});
			}
			const pct = formatPercent(1);
			process.stdout.write(`\repoch ${epoch + 1} of ${TRAINING_LOOPS} ${pct}`);
			console.log();
		}
		console.log();

		if (typeof TEST.summarize === 'function') {
			console.log(TEST.summarize(brain));
		}

		const testCases = typeof TEST_CASES === 'function'
			? TEST_CASES(TRAINING_DATA_COUNT)
			: TEST_CASES;

		let matches = 0;
		let count = 0;
		for (const {input, expected} of testCases) {
			process.stdout.write(`\rchecking test case ${count}`);
			const output = brain.think(input);
			if (TEST.matches(output, expected)) {
				matches += 1;
			}
			count++;
		}
		console.log();
		console.log('success rate', matches / count);
	}
}

export default App;

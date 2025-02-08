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

class App {
	async run(name = 'evens', brainOverride = undefined) {
		const {
			brain,
			TRAINING_LOOPS,
			TRAINING_DATA,
			TEST_CASES,
			TEST,
		} = await import(`./examples/${name}.js`);

		for (let epoch = 0; epoch < TRAINING_LOOPS; epoch++) {
			process.stdout.write(`epoch ${epoch} of ${TRAINING_LOOPS}`);
			for (const [i, {input, expected}] of TRAINING_DATA.entries()) {
				if (i % 123 === 0) {
					// await new Promise(unsleep => setTimeout(unsleep, 100));
					const pct = formatPercent(i/TRAINING_DATA.length);
					process.stdout.write(
						`\repoch ${epoch} of ${TRAINING_LOOPS} ${pct}`
					);
				}
				brain.learn({input, expected});
			}
			const pct = formatPercent(1);
			process.stdout.write(`\repoch ${epoch} of ${TRAINING_LOOPS} ${pct}`);
			console.log();
		}
		console.log();
		console.log(JSON.stringify({brain}, null, 2));

		let matches = 0;
		let count = 0;
		for (const {input, expected} of TEST_CASES) {
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

const fs = require('fs');
const process = require('process');
const svgGcode = require('svg_gcode');

(async () => {
	const outName = process.argv[2];
	const svg = fs.readFileSync(0, 'utf-8');
	const gcode = await svgGcode(svg, {
	  laserIntensity: 60,
	  laserOnSpeed: 400,
	  laserOffSpeed: 400,
	});

	const fixedGcode = [
		"M4 S0",
		gcode.replace(/^M3.+$/m, '')
	].join('\n');

	fs.writeFileSync(outName, fixedGcode);

	console.log('done');
})();

const express = require('express');
const qrcode = require('qrcode-terminal');
const natpmp = require('nat-pmp');

module.exports = async () => {
	console.log('starting ...');
	try {
		let ip;

		var client = natpmp.connect('192.168.1.1');
		// var client = natpmp.connect('100.115.92.207');

		client.externalIp(function (err, info) {
			if (err) throw err;
			ip = info.ip.join('.');
			console.log(`Current external IP address: ${ip}`);
		});

		const port = 6789;

		client.portMapping({
			private: port,
			public: port,
			ttl: 3600
		}, function (err, info) {
			if (err) throw err;
			console.log(info);

			const app = express();
			app.get('/', (request, response) => {
				response.send('Hello world');
			});

			app.listen(port);

			const url = `http://${ip}:${info.public}/`;
			qrcode.generate(url);
			console.log(`Listening on ${url}`);

		});
	} catch (err) {
		console.log('ERROR', err);
		return false;
	}

	return;
};

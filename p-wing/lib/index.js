const natpmp = require('nat-pmp');

module.exports = async () => {
	console.log('starting ...');
	try {
		// var client = natpmp.connect('192.168.1.1');
		var client = natpmp.connect('100.115.92.207');

		client.externalIp(function (err, info) {
			if (err) throw err;
			console.log('Current external IP address: %s', info.ip.join('.'));
		});

		client.portMapping({
			private: 22,
			public: 2222,
			ttl: 3600
		}, function (err, info) {
			if (err) throw err;
			console.log(info);
		});
	} catch (err) {
		console.log('ERROR', err);
		return false;
	}

	return;
};

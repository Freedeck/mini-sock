const ws = require('ws');

const uwsec = {
	opts: {
		idleTimeout: 32,
		maxBackpressure: 1024,
		maxPayloadLength: 512,
		compression: 0,
	},
	listeners: {},
	_wsc: {},
	queue: [],

	on: (event, cb) => {
		if (!uwsec.listeners[event]) uwsec.listeners[event] = [];
		uwsec.listeners[event].push(cb);
	},

	emit: (event, ...data) => {
		uwsec.queue.push(btoa(event) + ' ' + btoa(JSON.stringify(data)))
	},

	connect: (port, path) => {
		return new Promise((resolve, reject) => {
			const wsClient = new ws(`ws://localhost:${port}${path}`);
			uwsec._wsc = wsClient;
			uwsec.conn = 0;

			wsClient.on('open', () => {
				resolve(true);
				uwsec.conn = 1;
				setInterval(() => {
					if (uwsec.queue.length > 0) {
						wsClient.send(uwsec.queue.shift());
					}
				});
			});

			wsClient.on('close', () => {
				uwsec.conn = 0;
			});

			wsClient.on('message', (data) => {
				data = Buffer.from(data).toString('utf8');
				let found = uwsec.listeners[atob(data.split(' ')[0])];
				if (!found) found = (...a) => { }
				let args = JSON.parse(atob(data.split(' ')[1]));
				found.forEach(cb => cb(...args));
			});
		});
	},
}

module.exports = uwsec;
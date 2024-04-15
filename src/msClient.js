const ws = require('ws');

const msc = {
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
		if (!msc.listeners[event]) msc.listeners[event] = [];
		msc.listeners[event].push(cb);
	},

	emit: (event, ...data) => {
		msc.queue.push(btoa(event) + ' ' + btoa(JSON.stringify(data)))
	},

	connect: (port, path) => {
		return new Promise((resolve, reject) => {
			const wsClient = new ws(`ws://localhost:${port}${path}`);
			msc._wsc = wsClient;
			msc.conn = 0;

			wsClient.on('open', () => {
				resolve(true);
				msc.conn = 1;
				setInterval(() => {
					if (msc.queue.length > 0) {
						wsClient.send(msc.queue.shift());
					}
				});
			});

			wsClient.on('close', () => {
				msc.conn = 0;
			});

			wsClient.on('message', (data) => {
				data = Buffer.from(data).toString('utf8');
				let found = msc.listeners[atob(data.split(' ')[0])];
				if (!found) found = (...a) => { }
				let args = JSON.parse(atob(data.split(' ')[1]));
				found.forEach(cb => cb(...args));
			});
		});
	},
}

module.exports = msc;
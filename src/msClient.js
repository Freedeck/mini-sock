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

	connect: (ip, port, path) => {
		return new Promise((resolve, reject) => {
			let server = {
				ip, port, path,
				title: '',
				version: '',
				error: false,
			}
			fetch('http://'+ip+':'+port+path).then(res=>res.text()).then(fr=>{
				server['title'] = fr.split('@')[0],
				server['version'] = fr.split('@')[1].split(' - ms')[0]
			})
			const wsClient = new ws(`ws://${ip}:${port}${path}`);
			msc._wsc = wsClient;
			msc.conn = 0;
			
			wsClient.on('open', () => {
				msc.conn = 1;
				setInterval(() => {
					if (msc.queue.length > 0) {
						wsClient.send(msc.queue.shift());
					}
				});
				msc.on('info', (data) => {
					server['title'] = data.title;
					server['version'] = data.version;
					console.log('info')
					resolve(true, server)
				})
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
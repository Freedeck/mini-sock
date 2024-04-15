const { DEDICATED_COMPRESSOR_32KB } = require('uWebSockets.js');

const ms = {
	dataCache: {
		title: 'Freedeck Mini Sock Server',
		version: '0.2',
	},
	set: (k, v) => ms.dataCache[k] = v,
	get: (k) => ms.dataCache[k] || null,

	server: {},

	listeners: {},
	on: (event, cb) => {
		if (!ms.listeners[event]) ms.listeners[event] = [];
		ms.listeners[event].push(cb);
	},
	emit: (event, data) => {
		if (ms.listeners[event]) ms.listeners[event].forEach(cb => cb(data));
	}
};

const server = (port, path = "/*") => {
	return require('uWebSockets.js').App().ws(path, {

		/* There are many common helper features */
		idleTimeout: 32,
		maxBackpressure: 1024,
		maxPayloadLength: 512,
		compression: DEDICATED_COMPRESSOR_32KB,

		open: (ws, req) => {
			ws.on = (event, cb) => {
				ws['_ms'] = ws['_ms'] || {};
				ws['_ms'][event] = cb;
			};
			ws.emit = (event, ...data) => {
				ws.send(btoa(event) + ' ' + btoa(JSON.stringify(data)));
			};
			ms.emit('connection', ws, req);
		},

		message: (ws, message, isBinary) => {
			// parse arraybuffer
			const m1 = new TextDecoder().decode(message);
			let found = ws['_ms'][atob(m1.split(' ')[0])];
			if (!found) found = (...a) => { }
			let args = JSON.parse(atob(m1.split(' ')[1]));
			found(...args);
		}

	}).get('/*', (res, req) => {
		res.writeStatus('200 OK').end(ms.dataCache.title + '@' + ms.dataCache.version + ' - ms');
	}).listen(port, (listenSocket) => {

		if (listenSocket) {
			console.log('Listening to port', port);
		}

	});
};

ms.server = server;

module.exports = ms;

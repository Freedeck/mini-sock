const { DEDICATED_COMPRESSOR_32KB } = require('uWebSockets.js');

const uwse = {
	dataCache: {
		title: 'uWSE Default Server',
		version: '0.1-dev',
	},
	set: (k, v) => uwse.dataCache[k] = v,
	get: (k) => uwse.dataCache[k] || null,

	server: {},

	listeners: {},
	on: (event, cb) => {
		if (!uwse.listeners[event]) uwse.listeners[event] = [];
		uwse.listeners[event].push(cb);
	},
	emit: (event, data) => {
		if (uwse.listeners[event]) uwse.listeners[event].forEach(cb => cb(data));
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
				ws['_UWSE'] = ws['_UWSE'] || {};
				ws['_UWSE'][event] = cb;
			};
			ws.emit = (event, ...data) => {
				ws.send(btoa(event) + ' ' + btoa(JSON.stringify(data)));
			};
			uwse.emit('connection', ws, req);
		},

		message: (ws, message, isBinary) => {
			// parse arraybuffer
			const m1 = new TextDecoder().decode(message);
			let found = ws['_UWSE'][atob(m1.split(' ')[0])];
			if (!found) found = (...a) => { }
			let args = JSON.parse(atob(m1.split(' ')[1]));
			found(...args);
		}

	}).get('/*', (res, req) => {
		res.writeStatus('200 OK').end(uwse.dataCache.title + '@' + uwse.dataCache.version + ' - uWSE');
	}).listen(port, (listenSocket) => {

		if (listenSocket) {
			console.log('Listening to port', port);
		}

	});
};

uwse.server = server;

module.exports = uwse;

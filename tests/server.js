const uwse = require('../src/mini-sock').server;
uwse.set('title', 'Freedeck: uWSE');
uwse.set('version', '0.0.1-dev');

uwse.server(9001, '/*');

uwse.on('connection', (ws) => {
	console.log('New connection!')
	ws.on('abc', (msg) => {
		console.log('Abc message gotten from client', msg)
		ws.emit('def', 'ADS')
	})
});

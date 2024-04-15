const ms = require('../src/mini-sock').server;
ms.set('title', 'Freedeck: ms');
ms.set('version', '0.0.1-dev');

ms.server(9001, '/*');

ms.on('connection', (ws) => {
	console.log('New connection!')
	ws.on('abc', (msg) => {
		console.log('Abc message gotten from client', msg)
		ws.emit('def', 'ADS')
	})
});

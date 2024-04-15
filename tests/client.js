const uwsec = require('../src/mini-sock').client;

uwsec.connect(9001, '/sock').then((is) => {
	if(!is) console.log('Failed to connect to server')
	else console.log('Connected to server')
});

uwsec.emit('abc', {a:true})

uwsec.on('def', (cb) => {
	console.log('got def')
	console.log(cb)
})
const msc = require('../src/mini-sock').client;

msc.connect('localhost', 9001, '/sock').then((is, data) => {
	if(!is) console.log('Failed to connect to server')
	else console.log('Connected to server', data)
});

msc.emit('abc', {a:true})

msc.on('def', (cb) => {
	console.log('got def')
	console.log(cb)
})
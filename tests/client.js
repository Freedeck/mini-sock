const msc = require('../src/mini-sock').client;

msc.connect(9001, '/sock').then((is) => {
	if(!is) console.log('Failed to connect to server')
	else console.log('Connected to server')
});

msc.emit('abc', {a:true})

msc.on('def', (cb) => {
	console.log('got def')
	console.log(cb)
})
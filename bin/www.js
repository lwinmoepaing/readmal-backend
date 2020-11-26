const http = require('http')
const fs = require('fs')

// Create Logs Directory If Not Exist
var directories = [
	__dirname + '/../logs',
	__dirname + '/../logs/database',
	__dirname + '/../logs/access',
	__dirname + '/../logs/404',
	__dirname + '/../logs/error',
]

const checkAndMakeDirectory = async (	callback ) => {
	Promise.all(directories.map(dir => {
		if (!fs.existsSync(dir)){
			return fs.mkdirSync(dir)
		}
	})).then(callback)
}


checkAndMakeDirectory( () => {
	const app = require('../app')
	const port = normalizePort(process.env.PORT || '3000')

	/**
	 * After Check Directory async and make Hosting Server
	 * Create HTTP server.
	 */
	const server = http.createServer(app)
	server.listen(port, () => {
		const Console = console
		Console.log('\n============ Server Start ==============\n')
		Console.log(`Express server listening on port \n${process.env.BASE_URL}`)
	})
	server.on('error', onError)
	server.on('listening', onListening)

	/**
	 * Normalize a port into a number, string, or false.
	 */
	function normalizePort(val) {
		const port = parseInt(val, 10)

		if (isNaN(port)) {
			// named pipe
			return val
		}

		if (port >= 0) {
			// port number
			return port
		}

		return false
	}


	/**
	 * Event listener for HTTP server "error" event.
	 */

	function onError(error) {
		if (error.syscall !== 'listen') {
			throw error
		}

		const Console = console
		const bind = typeof port === 'string'
			? `Pipe ${port}`
			: `Port ${port}`

		// handle specific listen errors with friendly messages
		switch (error.code) {
		case 'EACCES':
			Console.error(`${bind} requires elevated privileges`)
			process.exit(1)
			break
		case 'EADDRINUSE':
			Console.error(`${bind} is already in use`)
			process.exit(1)
			break
		default:
			throw error
		}
	}


	/**
	 * Event listener for HTTP server "listening" event.
	 */

	function onListening() {
		const addr = server.address()
		const Console = console
		const bind = typeof addr === 'string'
			? `pipe ${addr}`
			: `port ${addr.port}`
		Console.log(`Listening on ${bind}`)
		Console.log('\n========================================\n')
	}
})




const moment = require('moment')
const fs = require('fs')

/**
 * Rare Case
 * If something went wrong internal Server Error
 * We'll log this case
 */
module.exports = (error, req, res, _next) => {
	let { statusCode = 500, message = 'Something went wrong', data } = error

	const errorResponse = {
		errorCode: 1, // it would be vary
		message,
		data
	}

	if(error.name === 'JsonWebTokenError') {
		statusCode = 401
	}

	if(error.message === 'No auth token') {
		statusCode = 401
	}

	const Console = console
	// Console.log('ErrorHa', error.name)
	Console.error(`Error ${statusCode}: ${message}` , _next)

	fs.appendFileSync(
		`${__dirname}/../logs/error.log`,
		`[${moment().format()}] Error ${statusCode}: ${message} ${error.message ? error.message : ''}\n`
	)

	res.status(statusCode).json(errorResponse)
}

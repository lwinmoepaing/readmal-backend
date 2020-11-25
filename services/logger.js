const morgan = require('morgan')
const path = require('path')
const fs = require('fs')
const moment = require('moment-timezone')

const accessLogStream = ({
	dirName =  './',
	fileName
}) => {
	return fs.createWriteStream(
		path.join(__dirname, '../', 'logs', dirName, `${fileName}`),
		{ flags: 'a' },
	)
}

morgan.token('date', () => {
	return moment().tz('Asia/Yangon').format()
})

morgan.token('user', (req) => {
	return  req.user ? `UserId:${req.user._id} Name:"${req.user.name}"`: '"Guest"'
})

morgan.format('loggerCustomFormat', '[:date[clf]] :method ":url", Status :status, ContentLength :res[content-length] - :response-time ms, :user')

module.exports = morgan('loggerCustomFormat', {
	format: 'default',
	stream: accessLogStream({
		dirName: 'access',
		fileName: moment().format('YYYY_MM_DD').toString() + '_' + 'access.log'
	}),
	skip: function (req, res) { return res.statusCode > 400 }
})

/**
 * Not Found Log'll write on 404.log
 *
 */
module.exports.notFoundLog = morgan('loggerCustomFormat', {
	format: 'default',
	stream: accessLogStream({
		dirName: '404',
		fileName: moment().format('YYYY_MM_DD').toString() + '_' + '404.log'
	}),
	skip: function (req, res) { return res.statusCode !== 404 }
})

/**
 * Output Only Error Logs.
 */
module.exports.errorLog = morgan('loggerCustomFormat', {
	format: 'default',
	stream: accessLogStream({
		dirName: 'error',
		fileName: moment().format('YYYY_MM_DD').toString() + '_' + 'error.log'
	}),
	skip: function (req, res) { return res.statusCode < 400 && res.statusCode !== 404 }
})

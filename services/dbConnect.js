const fs = require('fs')
const moment = require('moment')

//require mongoose module
const mongoose = require('mongoose')
mongoose.Promise = global.Promise

//require database URL from properties file
const { MONGO_URI } = require('../config')
const logPath = `${__dirname}/../logs/database/db.log`

//export this function and imported by server.js
module.exports = () => {

	const MONGO_OPTION = {
		useUnifiedTopology: true,
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false
	}

	mongoose.connect(MONGO_URI, MONGO_OPTION)

	mongoose.connection.on('connected', function(){
		const message = `Mongoose default connection is open to "${MONGO_URI}"`
		fs.appendFileSync(`${logPath}`, `[${moment().format()}] ${message}\n`)
		console.log(message)
	})

	mongoose.connection.on('error', function(err){
		const message = `Mongoose default connection has occured "${err}" error`
		fs.appendFileSync(`${logPath}`, `[${moment().format()}] ${message}\n`)
		console.log(message)
	})

	mongoose.connection.on('disconnected', function(){
		const message = 'Mongoose default connection is disconnected'
		fs.appendFileSync(`${logPath}`, `[${moment().format()}] ${message}\n`)
		console.log(message)
	})

	process.on('SIGINT', function(){
		mongoose.connection.close(function(){
			const message = 'Mongoose default connection is disconnected due to application termination'
			fs.appendFileSync(`${logPath}`, `[${moment().format()}] ${message}\n`)
			console.log(message)
			process.exit(0)
		})
	})
}

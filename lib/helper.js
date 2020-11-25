const fs = require('fs')
const Joi = require('@hapi/joi')
Joi.objectId = require('joi-objectid')(Joi)

module.exports = {
	/**
	 * Deep Clone For JavaScript
	 */
	DEEP_JSON_COPY: (jsonObject) => JSON.parse(JSON.stringify(jsonObject)),

	/**
	 * Joi Error Mapper
	 */
	MANAGE_ERROR_MESSAGE: (error) => {
		console.log(error)
		const { details } = error
		const data = details.map( err => {
			const { message, context: { label } } = err
			return {
				message,
				key: label
			}
		})

		return {
			errorStatusCode: 1,
			statusCode: 400,
			data
		}
	},

	/**
	 * File To Buffer
	 */
	FILE_TO_BUFFER: (filename, cb) => {
		let readStream = fs.createReadStream(filename)
		let chunks = []

		// Handle any errors while reading
		readStream.on('error', err => {
			// handle error

			// File could not be read
			return cb(err)
		})

		// Listen for data
		readStream.on('data', chunk => {
			chunks.push(chunk)
		})

		// File is done being read
		readStream.on('close', () => {
			// Create a buffer of the image from the stream
			return cb(null, Buffer.concat(chunks))
		})
	},

	/**
	 * Validate for Object Id,
	 * @description: to check is valid mongodb id
	 */
	IS_VALID_ID: (id) => {
		const schema = Joi.object({
			id: Joi.objectId(),
		})

		return schema.validate({ id })
	}
}


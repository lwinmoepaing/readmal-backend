const Joi = require('@hapi/joi')
const { ALL_IMAGE_PATH } = require('../../config')

/**
 * Auth Login Validator
 */
const Image_Validator = ({ file }) => {
	const schema = Joi.object().keys({
		// For Searching
		text: Joi.string().trim(true).allow('').optional(),

		image: Joi.any().meta({ swaggerType: 'file' })
			.description('Files to upload')
			.required(),

		path: Joi.string().valid(...ALL_IMAGE_PATH).required()
	})
	return schema.validate(file, {abortEarly: false})
}

module.exports.Image_Validator = Image_Validator

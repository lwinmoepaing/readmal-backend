const Joi = require('@hapi/joi')

/**
 * Auth Login Validator
 */
const Image_Validator = ({ file }) => {
	const schema = Joi.object().keys({
		image: Joi.any().meta({ swaggerType: 'file' })
			.description('file to upload')
			.required()
	})
	return schema.validate(file, {abortEarly: false})
}

module.exports.Image_Validator = Image_Validator

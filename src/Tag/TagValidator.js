const JoiDate = require('@hapi/joi-date')
const Joi = require('@hapi/joi').extend(JoiDate)
Joi.objectId = require('joi-objectid')(Joi)

/**
 * Tag Create Validator
 */
const Tag_Create_Validator = ({ body }) => {
	const schema = Joi.object().keys({
		name: Joi.string()
			.trim(true)
			.required(),
		blogs: Joi.array()
			.required(),
	})

	return schema.validate(body, {abortEarly: false})
}

module.exports.Tag_Create_Validator = Tag_Create_Validator

/**
 * Tag Update Validator
 */
const Tag_Update_Validator = ({ body }) => {
	const schema = Joi.object().keys({
		name: Joi.string()
			.trim(true),
		blogs: Joi.array()
	}).min(1)

	return schema.validate(body, {abortEarly: false})
}

module.exports.Tag_Update_Validator = Tag_Update_Validator

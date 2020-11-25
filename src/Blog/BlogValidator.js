const JoiDate = require('@hapi/joi-date')
const Joi = require('@hapi/joi').extend(JoiDate)
Joi.objectId = require('joi-objectid')(Joi)

/**
 * Blog Create Validator
 */
const BLOG_CREATE_VALIDATOR = ({ body }) => {
	const schema = Joi.object().keys({
		title: Joi.string()
			.trim(true)
			.required(),
		description: Joi.string()
			.trim(true)
			.required(),
		tags: Joi.array().min(1),
		lat: Joi.number().required(),
		lng: Joi.number().required(),
		place_name: Joi.string().trim(true),
		place_id: Joi.string().trim(true),
		formatted_address: Joi.string().trim(true)
	})

	return schema.validate(body, {abortEarly: false})
}

module.exports.BLOG_CREATE_VALIDATOR = BLOG_CREATE_VALIDATOR

/**
 * Blog Update Validator
 */
const BLOG_UPDATE_VALIDATOR = ({ body }) => {

	const schema = Joi.object().keys({
		headImg: Joi.string()
			.trim(true),
		title: Joi.string()
			.trim(true),
		description: Joi.string()
			.trim(true),

		addedTags: Joi.array().min(1),
		removeTags: Joi.array().min(1),

		lat: Joi.number().required(),
		lng: Joi.number().required(),

		place_name: Joi.string().trim(true),
		place_id: Joi.string().trim(true),
		formatted_address: Joi.string().trim(true)
	}).min(1)

	return schema.validate(body, {abortEarly: false})
}

module.exports.BLOG_UPDATE_VALIDATOR = BLOG_UPDATE_VALIDATOR

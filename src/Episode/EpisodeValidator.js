const Joi = require('@hapi/joi')
Joi.objectId = require('joi-objectid')(Joi)

/**
 * Episode Create Validator
 */
const Episode_Create_Validator = ({ body, user }) => {

	const userRole = user.role
	const isAdmin =  userRole === 'ADMIN'

	const keys = {
		// If get or not, we don't care
		// if not default is 'story.jpg' so dont worry
		image: Joi.string().trim(true),

		// Title must be required
		title: Joi.string().trim().min(3).required(),

		// Description: If at least string "" must be included
		description: Joi.string(),

		// To Show Description:
		is_show_description: Joi.boolean().optional(),

	}

	if (isAdmin) {

		if (body['addable_image_count']) {
			keys['addable_image_count'] = Joi.number().required()
		}

		if (body['addable_message_count']) {
			keys['addable_message_count'] = Joi.number().required()
		}

		keys['author'] = Joi.objectId().required()

	}

	const schema = Joi.object().keys(keys)
	return schema.validate({ ...body}, {abortEarly: false})
}

module.exports.Episode_Create_Validator = Episode_Create_Validator

/**
 * Episode Update Validator
 */
const Episode_Update_Validator = ({ body, user }) => {

	const userRole = user.role
	const isAdmin =  userRole === 'ADMIN'

	const keys = {
		// If get or not, we don't care
		// if not default is 'story.jpg' so dont worry
		image: Joi.string().trim(true),

		// Title must be required
		title: Joi.string().trim().min(3),

		// Description: If at least string "" must be included
		description: Joi.string().trim(true),

		// To Show Description:
		is_show_description: Joi.boolean(),

	}

	if (isAdmin) {

		if (body['addable_image_count']) {
			keys['addable_image_count'] = Joi.number()
		}

		if (body['addable_message_count']) {
			keys['addable_message_count'] = Joi.number()
		}

		if (body['is_editable']) {
			keys['is_editable'] = Joi.boolean()
		}

	}

	const schema = Joi.object().keys(keys).min(1)
	return schema.validate({ ...body}, {abortEarly: false})
}

module.exports.Episode_Update_Validator = Episode_Update_Validator

/**
 * Episode Publish Validator
 */
const Episode_Publish_Validator = ({ body }) => {
	const keys = {
		// To Show Description:
		is_published: Joi.boolean().required(),

	}
	const schema = Joi.object().keys(keys).min(1)
	return schema.validate({ ...body}, {abortEarly: false})
}

module.exports.Episode_Publish_Validator = Episode_Publish_Validator


/**
 * Episode PREMIUM Validator
 */
const Episode_Set_Premium_Validator = ({ body }) => {
	const keys = {
		// To Show Description:
		is_premium: Joi.boolean().required(),

	}
	const schema = Joi.object().keys(keys).min(1)
	return schema.validate({ ...body}, {abortEarly: false})
}

module.exports.Episode_Set_Premium_Validator = Episode_Set_Premium_Validator

/**
 * Context of Episode Create Validator
 */
const Episode_Update_Context_Validator = ({ body }) => {

	const contextSchema = Joi.object().keys({
		id: Joi.string().required(),

		type: Joi.string().valid(...['MESSAGE', 'THINKING_MESSAGE', 'IMAGE']).required(),

		message: Joi.string().allow('').optional(),

		context_position: Joi.string().valid(...['LEFT', 'RIGHT', 'CENTER']).required(),

		context_url: Joi.string().allow('').optional(),

		has_audio: Joi.boolean().optional(),

		audio_url: Joi.string().allow('').optional(),

		is_theme_change: Joi.boolean().optional(),

		theme_change_url: Joi.string().allow('').optional(),

		is_show_character: Joi.boolean().optional(),

		character: Joi.object().keys({

			id: Joi.string().trim(true).required(),

			name: Joi.string().trim(true).required(),

			color: Joi.string().trim(true).required(),

		}).required()

	})

	const keys = {
		// If get or not, we don't care
		// if not default is 'background_context.jpg' so dont worry
		background_context_image: Joi.string().trim(true),

		// To Context:
		context: Joi.array().items(contextSchema).required(),

	}

	const schema = Joi.object().keys(keys)
	return schema.validate({ ...body}, {abortEarly: false})
}

module.exports.Episode_Update_Context_Validator = Episode_Update_Context_Validator

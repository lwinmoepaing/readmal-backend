const Joi = require('@hapi/joi')
const { BOOK_CATEGORIES } = require('../../config')
Joi.objectId = require('joi-objectid')(Joi)
// const { ROLES } = require('../../config')
// const phRegex = new RegExp('(?=^(09))([0-9]{6,11})$|(?=^(01))([0-9]{6,8})$')

/**
 * Story Create Validator
 */
const Story_Create_Validator = ({ body, user }) => {

	const userRole = user.role
	const isAdmin =  userRole === 'ADMIN'

	const schema = Joi.object().keys({
		// If get or not, we don't care
		// if not default is 'story.jpg' so dont worry
		image: Joi.string().trim(true),

		// Title must be required
		title: Joi.string().trim().min(3).required(),

		// Category must be required
		category: Joi.string().valid(...BOOK_CATEGORIES).required(),

		// Description: If at least string "" must be included
		description: Joi.string().trim(true).optional(),

		// Episode Count: When Admin Create Story, we need to settle it
		addable_episode_count: isAdmin ? Joi.number().required() : Joi.number() ,

		// Is Including Premium Episodes: When Admin Create Story, we need to settle it
		is_including_premium: isAdmin ? Joi.boolean().required() : Joi.boolean() ,

		// You Need Author Id: When Admin Create Story
		author: isAdmin ? Joi.objectId().required(): Joi.objectId(),

	})
	return schema.validate({ ...body}, {abortEarly: false})
}

module.exports.Story_Create_Validator = Story_Create_Validator

/**
 * Story Update Validator
 */
const Story_Update_Validator = ({ body, user }) => {
	const userRole = user.role
	const isAdmin =  userRole === 'ADMIN'
	let keys = {
		// If get or not, we don't care
		// if not default is 'story.jpg' so dont worry
		image: Joi.string().trim(true),

		// Title must be required
		title: Joi.string().trim().min(3),

		// Description: If at least string "" must be included
		description: Joi.string().trim(true).optional(),
	}

	if (body['addable_episode_count'] && isAdmin) {
		keys['addable_episode_count'] = Joi.number()
	}

	const schema = Joi.object().keys(keys).min(1)

	return schema.validate({ ...body}, {abortEarly: false})
}

module.exports.Story_Update_Validator = Story_Update_Validator

/**
 * Story Published Validator
 */

const Story_Publish_Validator = ({ body }) => {

	const schema = Joi.object().keys({
		is_published: Joi.boolean().required(),
	})

	return schema.validate({ ...body}, {abortEarly: false})
}

module.exports.Story_Publish_Validator = Story_Publish_Validator

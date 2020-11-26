const Joi = require('@hapi/joi')
const { BOOK_CATEGORIES } = require('../../config')
Joi.objectId = require('joi-objectid')(Joi)
// const { ROLES } = require('../../config')
// const phRegex = new RegExp('(?=^(09))([0-9]{6,11})$|(?=^(01))([0-9]{6,8})$')

/**
 * User Update Validator
 */
const Story_Create_Validator = ({ body }) => {
	const schema = Joi.object().keys({
		// If get or not, we don't care
		// if not default is 'story.jpg' so dont worry
		image: Joi.string().trim(true),

		// Title must be required
		title: Joi.string().trim().min(3).required(),

		// Category must be required
		category: Joi.string().valid(...BOOK_CATEGORIES).required(),

		// Description: If at least string "" must be included
		description: Joi.string().trim(true).required(),

		// Episode Count, When Admin Create Story, we need to settle it
		addable_episode_count: Joi.number(),

		// Is Including Premium Episodes, When Admin Create Story, we need to settle it
		is_including_premium: Joi.boolean(),

	})
	return schema.validate({ ...body}, {abortEarly: false})
}

module.exports.Story_Create_Validator = Story_Create_Validator

const Joi = require('@hapi/joi')
Joi.objectId = require('joi-objectid')(Joi)
// const { ROLES } = require('../../config')
// const phRegex = new RegExp('(?=^(09))([0-9]{6,11})$|(?=^(01))([0-9]{6,8})$')

/**
 * User Update Validator
 */
const User_Update_Validator = ({ body }) => {
	const schema = Joi.object().keys({
		name: Joi.string()
			.trim(true)
			.min(3)
			.max(30),

		password: Joi.string(),
		/**
		 * Enum .valid() mean is valid with specific values
		 */
		// role: Joi.string().valid(...ROLES),
		// skills: Joi.array(),
		// phone: Joi.string().pattern(phRegex),
	}).min(1)
	return schema.validate({ ...body}, {abortEarly: false})
}

module.exports.User_Update_Validator = User_Update_Validator

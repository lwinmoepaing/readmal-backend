const Joi = require('@hapi/joi')
// const { ROLES } = require('../../config')
// const pattern = /(?=^(09))([0-9]{6,11})$|(?=^(01))([0-9]{6,8})$/
// const phRegex = new RegExp('(?=^(09))([0-9]{6,11})$|(?=^(01))([0-9]{6,8})$')

/**
 * Auth Register Validator
 */
const Auth_Register_Validator = ({ body }) => {
	const schema = Joi.object().keys({
		name: Joi.string()
			.min(3)
			.max(30)
			.required(),
		email: Joi.string()
			.email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
			.required(),
		password: Joi.string()
			.min(6)
			.required(),
		// phone: Joi.string().pattern(phRegex).required(),
		// role: Joi.string().valid(...ROLES),
		// skills: Joi.array()
	})
	return schema.validate(body, {abortEarly: false})
}

module.exports.Auth_Register_Validator = Auth_Register_Validator

/**
 * Auth Login Validator
 */
const Auth_Login_Validator = ({ body }) => {
	const schema = Joi.object().keys({
		email: Joi.string()
			.email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
			.required(),
		password: Joi.string()
			.required()
	})
	return schema.validate(body, {abortEarly: false})
}

module.exports.Auth_Login_Validator = Auth_Login_Validator

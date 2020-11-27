const bcrypt = require('bcrypt')
const passport = require('passport')
const jwt = require('jsonwebtoken')
// Model Import
const User = require('../User/UserModel')
// Self Import
const { JWT_SECRET, USER_IMAGE_PATH } = require('../../config')
const { MANAGE_ERROR_MESSAGE } = require('../../lib/helper')
const { errorResponse, successResponse } = require('../../lib/responseHandler')
const { Auth_Register_Validator, Auth_Login_Validator } = require('./AuthValidator')
const { updateCurrentToken } = require('./AuthHelper')

/**
 * @desc: CREATE USER
 */
module.exports.CREATE_USER = async (req, res) => {
	const { error } = await Auth_Register_Validator(req)

	if(error) {
		res.status(400).json( MANAGE_ERROR_MESSAGE(error) )
		return
	}

	try {
		const isExistUser = await User.findOne({ email: req.body.email })
		if(isExistUser) {
			throw new Error('Your email is Already Registered')
		}

		const salt = await bcrypt.genSalt(10)
		const password = await bcrypt.hash(req.body.password, salt)
		const user = new User({ ...req.body, password })
		await user.save()

		passport.authenticate('local', {session: false}, (err, user) => {
			if (err || !user) {
				return res.status(400).json(errorResponse(err))
			}
			req.login(user, {session: false}, async (err) => {
				if (err) { res.status(400).json(errorResponse(err)) }
				// Filters Data
				const { _id, name, email } = user
				const data = { _id, name, email }
				// Set JWT Token
				const token = jwt.sign(data, JWT_SECRET)

				try {
					await updateCurrentToken(_id, token)
				}
				catch(e) {
					console.log(e)
				}

				return res.json({ ...successResponse(user, 'Successfully Registered'), token})
			})
		})(req, res)
	}
	catch (e) {
		res.status(400).json(errorResponse(e))
	}
}

/**
 * @desc: Login User
 */
module.exports.LOGIN_USER = async (req, res) => {
	// Check Validating
	const { error } = await Auth_Login_Validator(req)

	if(error) {
		res.status(400).json( MANAGE_ERROR_MESSAGE(error) )
		return
	}

	passport.authenticate('local', {session: false}, (err, user) => {
		if (err || !user) {
			return res.status(400).json(errorResponse(err))
		}
		req.login(user, {session: false}, async (err) => {
			if (err) { res.status(400).json(errorResponse(err)) }
			// console.log('user', user)
			// Filters Data
			const { _id, name, email } = user
			const data = { _id, name, email }
			// Set JWT Token
			const token = jwt.sign(data, JWT_SECRET)

			try {
				await updateCurrentToken(_id, token)
			}
			catch(e) {
				console.log(e)
			}
			return res.status(200).json({ ...successResponse(user, 'Successfully Login'), token})
		})
	})(req, res)
}


/**
 * @desc: GET Profile Data
 */
module.exports.GET_PROFILE_DATA = async (req, res) => {
	try {
		// console.log('req.user.email', req.user.email)
		let user = await User
			.findOne({ email: req.user.email })
			.select('-__v -updatedAt -createdAt -deletedAt -stories -current_token -facebook_social_id')
		if(!user) {
			throw new Error ('User Not Found ')
		}

		user.image = `${process.env.BASE_URL}/${USER_IMAGE_PATH}/${user.image}`

		res.status(200).json(
			successResponse(user,'Successfully Fetching User Profile')
		)
	} catch (e) {
		res.status(401).json(errorResponse(e))
	}
}

/**
 * @desc: Response Token when Login with Facebook
 */
module.exports.LOGIN_WITH_FACEBOOK = (req, res) => {
	return res.status(200).json({ ...successResponse(null, 'Successfully Login'), token: req.query.token})
}


module.exports.LOGIN_WITH_FACEBOOK_CALLBACK = (req, res) => {
	// Successful authentication, redirect home.
	res.redirect(process.env.API_URL + '/auth/' + 'successLogin?token=' + req.user )
}



/*
 * This module lets you authenticate endpoints using a JSON web token.
 * It is intended to be used to secure RESTful endpoints without sessions.
 * @doc : https://www.npmjs.com/package/passport-jwt
 *
 * Facebook Passport
 * @doc : https://github.com/jaredhanson/passport-facebook
 */

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { JWT_SECRET } = require('../config')
const facebookStrategy = require('passport-facebook').Strategy

// Model Import
const User = require('../src/User/UserModel')
const { updateCurrentToken, updateCurrentTokenAndFacebookId } = require('../src/Auth/AuthHelper')

const facebookParams = {
	clientID: process.env.FACEBOOK_CLIENT_ID,
	clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
	callbackURL: process.env.FACEBOOK_CALLBACK_URL,
	profileFields: ['id', 'displayName', 'name', 'gender', 'picture.type(large)', 'email']
}

// console.log('Facebook Parmas', facebookParams)

module.exports = (passport) => {

	passport.serializeUser(function (jwtToken, cb) {
		console.log('Inside Serialize User, Return Token')
		// console.log('And get user data => ', user)
		cb(null, jwtToken)
	})

	// passport.deserializeUser(function (id, cb) {
	// 	console.log('Inside deserialize User')
	// 	console.log('And get idect => ', id)
	// 	cb(null, id)
	// })

	passport.use(
		new facebookStrategy(facebookParams,
			async (token, refreshToken, profile, done) => {
				// When Callback
				// console.log('\ntoken', token )
				// console.log('\nrefreshToken', refreshToken )
				// console.log('\nprofile => \n', profile)

				// First We need to check if exist email
				try {
					const isGetEmailFromFbAccount = profile.emails.length > 0
					const emailFromFb = isGetEmailFromFbAccount ?  profile.emails[0].value : null

					if (isGetEmailFromFbAccount) {
						const isExistUserWithEmail = await User.findOne({ email: emailFromFb })

						if (isExistUserWithEmail) {
							const jwtToken = jwt.sign(getUserData(isExistUserWithEmail), JWT_SECRET)
							await updateCurrentTokenAndFacebookId(isExistUserWithEmail._id, profile.id, jwtToken)
							return done(null, jwtToken)
						}
					}

					// Checking If Already Exist User with Facebook Id
					const isExistUserWithFbId = await User.findOne({ facebook_social_id: profile.id})

					if (isExistUserWithFbId) {
						const jwtToken = jwt.sign(getUserData(isExistUserWithFbId), JWT_SECRET)
						await updateCurrentToken(isExistUserWithFbId._id, jwtToken)
						return done(null, jwtToken)
					}

					const salt = await bcrypt.genSalt(10)
					const password = await bcrypt.hash(process.env.READMAL_SECRET, salt)
					const user = new User({
						name: profile.displayName,
						email: emailFromFb ,
						password: password,
						facebook_social_id: profile.id,
					})
					await user.save()
					const currentToken = jwt.sign(getUserData(user), JWT_SECRET)
					await updateCurrentToken(user._id, currentToken)
					return done(null, currentToken)
				}
				catch(e) {
					console.log('Error Inside Facebook Authen', e)
					return done(e)
				}
			})
	)
}

function getUserData(user) {
	const { _id, name, email } = user
	const data = { _id, name, email }
	return data
}

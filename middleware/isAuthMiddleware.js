const passport = require('passport')
const { errorResponse } = require('../lib/responseHandler')
const User = require('../src/User/UserModel')

module.exports = (req, res, next) => {
	passport.authenticate('jwt', { session: false }, async (err, user, info) => {
		// If authentication failed, `user` will be set to false. If an exception occurred, `err` will be set.
		if (err || !user) {
			// PASS THE ERROR OBJECT TO THE NEXT ROUTE i.e THE APP'S COMMON ERROR HANDLING MIDDLEWARE
			return next(info)
		} else {
			req.user = user

			// Get Request Bearer Token , example ['Bearer', 'tokenCode...']
			const requestToken = req.headers.authorization.split(' ')[1]
			// Fetch user data in db, bcoz all we gotta make sure for single device
			const userInsideDb = await User.findById(user._id)

			// If same token, we should go next step
			const isMatchToken = requestToken === userInsideDb.current_token
			if (isMatchToken) {
				return next()
			}

			// Else We must show expired message.
			const expiredMessage = 'Token Expired for one single Device'
			return res.status(401).json(errorResponse(new Error(expiredMessage)))

		}
	})(req, res, next)
}

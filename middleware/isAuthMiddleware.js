const passport = require('passport')
module.exports = (req, res, next) => {
	passport.authenticate('jwt', { session: false }, function(err, user, info) {
		// If authentication failed, `user` will be set to false. If an exception occurred, `err` will be set.
		if (err || !user) {
			// PASS THE ERROR OBJECT TO THE NEXT ROUTE i.e THE APP'S COMMON ERROR HANDLING MIDDLEWARE
			return next(info)
		} else {
			req.user = user
			return next()
		}
	})(req, res, next)
}

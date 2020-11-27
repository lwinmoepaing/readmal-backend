const User = require('../User/UserModel')

module.exports.updateCurrentToken = (userId, token) => {
	return User.findByIdAndUpdate(userId, {
		current_token: token
	}, { new: true })
}


module.exports.updateCurrentTokenAndFacebookId = (userId, facebookId, token) => {
	return User.findByIdAndUpdate(userId, {
		current_token: token,
		facebook_social_id: facebookId
	})
}

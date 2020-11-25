const User = require('../User/UserModel')

module.exports.updateCurrentToken = (userId, token) => {
	return User.findByIdAndUpdate(userId, {
		current_token: token
	})
}

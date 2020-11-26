const User = require('../src/User/UserModel')
const bcrypt = require('bcrypt')

module.exports = async () => {

	const salt = await bcrypt.genSalt(10)
	const password = await bcrypt.hash('123456', salt)

	const users = [
		{
			name: 'Lwin Moe Paing',
			email: 'lwinmoepaing007@gmail.com',
			password,
			role: 'ADMIN'
		},
		{
			name: 'Mg Author',
			email: 'author@gmail.com',
			password,
			role: 'AUTHOR'
		},
		{
			name: 'Mg User',
			email: 'user@gmail.com',
			password,
			role: 'USER'
		},
	]

	const UserPromises = users.map(user => User.findOneOrCreate({ email: user.email}, user))

	Promise.all(UserPromises)
}

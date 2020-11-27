const { ObjectId } = require('mongoose').mongo
const User = require('../src/User/UserModel')
const bcrypt = require('bcrypt')

module.exports = async () => {

	const salt = await bcrypt.genSalt(10)
	const password = await bcrypt.hash('123456', salt)

	const users = [
		{
			_id: ObjectId('5fbff7edc2f87522b43f3785'),
			name: 'Lwin Moe Paing',
			email: 'lwinmoepaing007@gmail.com',
			facebook_social_id: '2006270212842582',
			password,
			role: 'ADMIN'
		},
		{
			_id: ObjectId('5fc0b899a953c43ab047deb5'),
			name: 'Mg Admin',
			email: 'admin@gmail.com',
			password,
			role: 'ADMIN'
		},
		{
			_id: ObjectId('5fbff7edc2f87522b43f3787'),
			name: 'Mg Author',
			email: 'author@gmail.com',
			password,
			role: 'AUTHOR'
		},
		{
			_id: ObjectId('5fbff7c6e547fd3cec0fbcf7'),
			name: 'Mg User',
			email: 'user@gmail.com',
			password,
			role: 'USER'
		},
	]

	const UserPromises = users.map(user => User.findOneOrCreate({ email: user.email}, user))

	Promise.all(UserPromises)
}

const uuid = require('uuid/v4')
module.exports.Character = class Character {
	constructor (id , name = 'Mg Mg', color = '#81ecec') {
		this.id = id ? id : uuid()
		this.name = name
		this.color = color
	}
}

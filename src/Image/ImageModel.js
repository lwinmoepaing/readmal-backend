const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const { Schema } = mongoose

/**
 * Create User Schema
 * @doc : User Scalable Schema
 */
const imageSchema = new Schema({
	url: {
		type: String,
		unique: true,
		required: true,
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		index: true,
		required: true,
	},
	note: {
		type: String
	},
	deletedAt: {
		type: Date,
		default: null,
		index: true
	}
}, {
	timestamps: true,
})

// Plugin Paginate
imageSchema.plugin(mongoosePaginate)

const User = mongoose.model('Image', imageSchema)
// Export User
module.exports = User

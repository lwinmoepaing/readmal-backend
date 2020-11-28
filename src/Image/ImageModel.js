const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const { ALL_IMAGE_PATH } = require('../../config')
const { Schema } = mongoose

/**
 * Create User Schema
 * @doc : User Scalable Schema
 */
const imageSchema = new Schema({
	path: {
		type: String,
		enum: ALL_IMAGE_PATH,
		required: true,
		default: 'profile'
	},
	image: {
		type: String,
		unique: true,
		required: true,
	},
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		index: true,
		required: true,
	},
	text: {
		type: String,
		index: true
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

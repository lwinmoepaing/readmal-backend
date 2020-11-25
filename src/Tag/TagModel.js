const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const { Schema } = mongoose

/**
 * Create Tags Schema
 * @doc : Tags Scalable Schema
 */
const tagSchema = new Schema({
	name: {
		type: String,
		unique: true,
		required: true
	},

	blogs: [{type: Schema.Types.ObjectId, ref: 'Blog'}],
}, {
	timestamps: true,
})

// Plugin Paginate
tagSchema.plugin(mongoosePaginate)

const Tag = mongoose.model('Tag', tagSchema)
module.exports = Tag

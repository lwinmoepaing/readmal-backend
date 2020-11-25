const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const Tag = require('../Tag/TagModel')

const { Schema } = mongoose

/**
 * Create Blog Schema
 * @doc : Blog Scalable Schema
 */
const blogSchema = new Schema({
	headImg: {
		type: String,
		required: true
	},

	title: {
		type: String,
		required: true,
		index: true
	},

	author: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		index: true,
		required: true,
	},

	description: {
		type: String,
		required: true,
	},

	type: {
		type: String,
		enum: ['Point'],
		default: 'Point',
		required: true
	},

	coordinates: {
		type: [Number],
		required: true
	},

	place_name:{
		type: String,
	},

	place_id:{
		type: String,
	},

	formatted_address:{
		type: String,
	},

	tags: [{type: Schema.Types.ObjectId, ref: 'Tag'}],

	deletedAt: {
		type: Date,
		default: null,
		index: true
	}
}, {
	timestamps: true,
})

// Defined Tags indexing to fast search query
blogSchema.index({'tags': 1}, {index: true})

// Plugin Paginate
blogSchema.plugin(mongoosePaginate)

/**
 * After Saving New Blogs
 * We'll set Tags Reference
 */
blogSchema.post('save', async (doc) => {
	if(!doc.tags) return
	try {
		const tagPromiseLists = doc.tags.map(id =>
			Tag.findByIdAndUpdate({_id: id}, {$addToSet: {blogs: doc._id}})
		)
		await Promise.all(tagPromiseLists)
	} catch (e) {
		console.log(e)
	}
})

const Blog = mongoose.model('Blog', blogSchema)
// Export Blog
module.exports = Blog

const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const { Schema } = mongoose

/**
 * Create Story Schema
 * @doc : Story Scalable Schema
 */
const storySchema = new Schema({
	image: {
		type: String,
		required: true,
		defualt: 'story.jpg'
	},

	title: {
		type: String,
		required: true,
		index: true
	},

	// Description is Show Description of Stories
	description: {
		type: String,
		default: '',
	},

	is_show_description: {
		type: Boolean,
		required: true,
		default: false,
	},

	// When Author is publishing story, we can access to edit this story
	is_published: {
		type: Boolean,
		required: true,
		default: false,
		index: true,
	},

	// Set Index True, when we search finished stories, ( I mean complete )
	// if false mean it's ongoing story, if true we don't add more episodes
	is_finished: {
		type: Boolean,
		required: true,
		default: false,
		index: true,
	},

	// Throphy, Like Champion, 1stRunnerUP
	is_has_achievement: {
		type: Boolean,
		required: true,
		default: false,
		index: true,
	},

	// Author's stories is store story objectid Reference to Story Table
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		index: true
	},

	// When story is reported we should hold reported story
	is_reported: {
		type: Boolean,
		required: true,
		default: false
	},

	// It's must be there, becoz some of episode may be preimum episode
	// but it's only show premium story or not for front end
	is_including_premium: {
		type: Boolean,
		required: true,
		default: false,
		index: true,
	},

	// Deleted At
	deletedAt: {
		type: Date,
		default: null
	}


}, {
	timestamps: true,
})


// Plugin Paginate
storySchema.plugin(mongoosePaginate)

const User = mongoose.model('Story', storySchema)

// Export User
module.exports = User

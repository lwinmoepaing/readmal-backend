const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const { THROPHY_RANKS, BOOK_CATEGORIES } = require('../../config')
const { Schema } = mongoose
const shortUUID = require('short-uuid')

/**
 * Create Story Schema
 * @doc : Story Scalable Schema
 */
const storySchema = new Schema({

	// Short Url for Sharing Facebook or
	// For Generate Short URL
	short_url: {
		type: String,
		required: true,
		index: true,
		unique: true,
		default: shortUUID.generate()
	},

	// Image jus string, path can be defined by controller
	// sometime we can change space example can use aws storage services
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

	// Category for Searching so it must be index
	category: {
		type: String,
		enum: BOOK_CATEGORIES,
		required: true,
		index: true,
		default: 'Horror',
	},

	// Description is Show Description of Stories
	description: {
		type: String,
		default: '',
	},

	// When Author is publishing story, we can access to edit this story
	// Note: wanna publish, at least one episode need to be published [set true]
	// And If Episodes Lenght is zero, we can't published
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

	// If User is Premium_Author , we add extra +2 count 5
	addable_episode_count: {
		type: Number,
		requird: true,
		default: 3,
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

	// Follow Each Attributes for Story War
	// It can be null,
	story_war: {
		type: Schema.Types.ObjectId,
		ref: 'StoryWar',
		default: null,
		index: true
	},

	story_war_position: {
		type: String,
		enum: THROPHY_RANKS,
		default: null,
		index: true,
	},

	// Throphy, Like Champion, 1stRunnerUP
	is_has_achievement: {
		type: Boolean,
		required: true,
		default: false,
		index: true,
	},

	// Episodes
	episodes:	[
		{
			type: Schema.Types.ObjectId,
			ref: 'Episode'
		}
	],

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

const Story = mongoose.model('Story', storySchema)

// Export Story
module.exports = Story

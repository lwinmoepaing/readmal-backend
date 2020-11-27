const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const { Schema } = mongoose
// const short = require('short-uuid')
// const uuid = require('uuid/v4')


/**
 * Context Schema Mean
 * Message Characters Array, it may be image or audio or messageType
 */
const characterSchema = new Schema({
	id: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	color: {
		type: String,
		required: true
	}
}, { _id: false })

const contextSchema = new Schema({
	type: {
		type: String,
		enum: ['AUDIO', 'MESSAGE', 'THINKING_MESSAGE', 'IMAGE'],
		default: 'TEXT',
		required: true
	},
	message: {
		type: String,
		required: true,
		default: ''
	},
	context_position: {
		type: String,
		enum: ['LEFT', 'RIGHT', 'CENTER'],
		default: 'LEFT',
		required: true
	},
	context_url: {
		type: String,
		default: '',
		required: true
	},
	is_theme_change: {
		type: Boolean,
		default: false,
	},
	is_theme_change_url: {
		type: String,
		default: '',
		required: true
	},
	character: {
		type: characterSchema,
		required: true
	}
}, { _id: false })

/**
 * Create Story Schema
 * @doc : Story Scalable Schema
 */
const episodeSchema = new Schema({

	// Image jus string, path can be defined by controller
	// sometime we can change space example can use aws storage services
	image: {
		type: String,
		required: true,
		default: 'episode.jpg'
	},

	background_context_image: {
		type: String,
		required: true,
		default: 'background_context.jpg'
	},

	title: {
		type: String,
		required: true,
		default: '',
	},

	// Description is Show Description of Stories
	description: {
		type: String,
		default: '',
	},

	// Description is Show Description of Stories
	is_show_description: {
		type: Boolean,
		required: true,
		default: true,
	},

	episode_number: {
		type: Number,
		required: true,
		default: 1,
	},

	addable_image_count: {
		type: Number,
		required: true,
		default: 3,
	},

	addable_message_count: {
		type: Number,
		required: true,
		default: 110
	},

	// When Publish is Editable set to false
	is_editable: {
		type: Boolean,
		required: true,
		default: true,
	},

	// When Publish is Editable set to false
	is_published: {
		type: Boolean,
		required: true,
		default: false,
	},

	// Is Premium , Premium Episode
	// Logic is check story, if story is including premium
	// all next episodes are lock with premium
	is_premium: {
		type: Boolean,
		required: true,
		default: false,
	},

	// Context mean all data message
	context: {
		type: [contextSchema],
		default: []
	},

	// When edit context, we tempory save this snap context
	// This may be wrong
	snap_context: {
		type: [contextSchema],
		default: []
	},

	// When author save publish, we could save this context
	first_time_context: {
		type: [contextSchema],
		default: []
	},

	// Author's episodes are stored objectid Reference to Episode Table
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		index: true
	},

	// story own this episode.
	story: {
		type: Schema.Types.ObjectId,
		ref: 'Story',
		required: true,
		index: true
	},

	// Viewrs Mean when user is reading at least one episode 80%
	viwers: [{
		type: Schema.Types.ObjectId,
		ref: 'User',
	}],

	// Deleted At
	deletedAt: {
		type: Date,
		default: null
	}

}, {
	timestamps: true,
})

// Find One Or Creata is Custom
// For Seeding
episodeSchema.static('findOneOrCreate', async function findOneOrCreate(condition, doc) {
	const one = await this.findOne(condition)

	return one || this.create(doc)
})


// Plugin Paginate
episodeSchema.plugin(mongoosePaginate)

const Episode = mongoose.model('Episode', episodeSchema)

// Export Episode
module.exports = Episode

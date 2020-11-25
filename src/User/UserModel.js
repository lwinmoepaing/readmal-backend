const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const { ROLES, RELATIONSHIP_STATE } = require('../../config')
const { PACKAGES, Package } = require('./UserHelper')
const { Schema } = mongoose

const packageSchema = new Schema({
	name: {
		type: String,
		enum: PACKAGES,
	},
	description: {
		type: String,
		default: '',
	}
})

/**
 * Create User Schema
 * @doc : User Scalable Schema
 */
const userSchema = new Schema({
	name: {
		type: String,
		required: true,
		index: true
	},

	email: {
		type: String,
		unique: true,
		required: true
	},

	password: {
		type: String,
		required: true
	},

	// In this case, we only put image name,
	// not full path, bcoz we can use some space storage services
	// example AWS storage Service
	image: {
		type: String,
		default: 'profile.png'
	},

	role: {
		type: String,
		enum: ROLES,
		default: 'USER',
		index: true
	},

	// It's Optional, but we must know family users can hv same phone number
	phone: {
		type: String,
		default: null,
		index: true,
	},

	// Is Verified Author or User
	is_verified: {
		type: Boolean,
		default: false,
		index: true,
	},

	// When User Login With Facebook Social Id
	facebook_social_id: {
		type: String,
		index: true,
		default: null,
	},

	// It's Optional
	address: {
		type: String,
		default: '',
	},

	// Most of people are interested in Relationship State,
	// That's why we added
	is_show_relationship: {
		type: Boolean,
		default: false,
	},

	relationship_state: {
		type: String,
		enum: RELATIONSHIP_STATE,
		default: 'Single',
	},

	// Story State

	// If user's role is author, we need to set count 3 monthly
	// If premiun_author set 5 or something like that
	story_monthly_count: {
		type: Number,
		default: 0,
	},

	// Author's stories is store story objectid Reference to Story Table
	stories: [{type: Schema.Types.ObjectId, ref: 'Story'}],

	// Current Token
	// Hold for one single protected device .
	current_token: {
		type: String,
		default: null,
	},

	// When User Buy some package, we need to fill this field,
	// note: may be null value, when this user is free user.
	package: {
		type: packageSchema,
		default: new Package('MONTHLY_SUBSCRIBE')
	},

	expiredAt: {
		type: Date,
		default: null,
		index: true
	},

	// Deleted At
	deletedAt: {
		type: Date,
		default: null,
		index: true
	},

	// When User is Baned for some reasons.
	isBanedUser: {
		type: Boolean,
		default: false,
		index: false,
	}

}, {
	timestamps: true,
})


// Plugin Paginate
userSchema.plugin(mongoosePaginate)

const User = mongoose.model('User', userSchema)

// Export User
module.exports = User

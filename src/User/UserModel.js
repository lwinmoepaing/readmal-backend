const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const { ROLES, RELATIONSHIP_STATE, THROPHY_RANKS, PAYMENT_TYPES } = require('../../config')
const {
	PACKAGES,
	//  Package
} = require('./UserHelper')
const { Schema } = mongoose


const paymentInfoSchema = new Schema({
	type: {
		type: String,
		enum: PAYMENT_TYPES,
	},
	context: {
		type: String,
		default: '',
	},
})

/**
 * User bought package, for pricing
 */
const packageSchema = new Schema({
	name: {
		type: String,
		enum: PACKAGES,
	},
	description: {
		type: String,
		default: '',
	},
	expiredAt: {
		type: Date,
		default: Date.now()
	}
})

/**
 * When User win some tournament, you can check
 * after fetching AuthorData, that's why we should set like this Schema
 */
const userAchievementSchema = new Schema({
	story_war_title: {
		type: String,
		required: true,
	},
	story_title: {
		type: String,
		required: true
	},
	position: {
		type: String,
		enum: THROPHY_RANKS,
		index: true,
		required: true,
	},
	description: {
		type: String,
		default: '',
	},
	story_war_image: {
		type: String,
		default: 'storywar.jpg'
	},
	story_war_id: {
		type: Schema.Types.ObjectId,
		ref: 'StoryWar',
		required: true,
		index: true
	},
	story_id: {
		type: Schema.Types.ObjectId,
		ref: 'Story',
		required: true,
		index: true
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
		index: true
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

	relationship_status: {
		type: String,
		enum: RELATIONSHIP_STATE,
		default: 'Single',
	},

	// When is Author,
	// Example when published stoies is morethan 20, we update Bishop
	// Something Like that
	rank: {
		type: String,
		enum: ['Citizen', 'Bishop', 'Knight', 'Legendary'],
		default: 'Citizen',
		index: true
	},

	// Story State

	// If user's role is author, we need to set count 3 monthly
	// If premiun_author set 5 or something like that
	story_monthly_count: {
		type: Number,
		default: 3,
	},

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
		// default: new Package('MONTHLY_SUBSCRIBE')
		default: null
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
	},

	achievements: {
		type: [userAchievementSchema],
		default: [],
	},

	// When he wanna make say transaction
	// We must know his payment info
	paymentInfo: {
		type: [paymentInfoSchema],
		default: []
	}

}, {
	timestamps: true,
})

// Find One Or Creata is Custom
// For Seeding
userSchema.static('findOneOrCreate', async function findOneOrCreate(condition, doc) {
	const one = await this.findOne(condition)

	return one || this.create(doc)
})

// Plugin Paginate
userSchema.plugin(mongoosePaginate)

const User = mongoose.model('User', userSchema)

// Export User
module.exports = User

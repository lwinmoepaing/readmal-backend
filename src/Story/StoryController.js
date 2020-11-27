const short = require('short-uuid')
const uuid = require('uuid/v4')

const { MANAGE_ERROR_MESSAGE, IS_VALID_ID, DEEP_JSON_COPY } = require('../../lib/helper')
const { errorResponse, successResponse } = require('../../lib/responseHandler')
const { Story_Create_Validator, Story_Update_Validator } = require('./StoryValidator')

const Story = require('./StoryModel')
const User = require('../User/UserModel')
const { USER_IMAGE_PATH, STORY_IMAGE_PATH } = require('../../config')

/**
 * Create Story
 * @note : Request user may be ADMIN or AUTHOR
 * may be different logic
 */
module.exports.CREATE_STORY = async (req, res) => {
	const { error, value } = Story_Create_Validator(req)

	if (error) {
		res.status(400).json( MANAGE_ERROR_MESSAGE(error) )
		return
	}

	try {
		const body = value
		const short_url = short.generate(uuid())
		const isAdmin = req.user.role === 'ADMIN'
		const isAuthor = req.user.role === 'AUTHOR'
		const requestUserId = req.user._id

		// If Request User is Author Case
		if (isAuthor) {
			console.log('\nRequest user is Author with Own Story\n>>>>')

			// At First we need to check Story Addable Count is
			const storyAddableCount = req.user.story_monthly_count

			if (storyAddableCount <= 0) {
				throw new Error('Cant More Create Stories For this Month.')
			}

			const storyParam = {
				...body,
				short_url,
				createdBy: requestUserId,
				author: requestUserId
			}
			// If There is Other Attributes , had to delete
			// to be safe Process
			delete storyParam.addable_episode_count
			delete storyParam.is_including_premium
			delete storyParam.author

			const story = new Story(storyParam)

			await story.save()

			// Decrease Story Monthly Count
			await User.findByIdAndUpdate(requestUserId, {story_monthly_count: storyAddableCount - 1})

			res.status(200).json(successResponse(story, 'Successfully Story Created'))
			return
		}

		// If Request User is Admin Case
		else if (isAdmin) {
			const checkAuthor = await User.findById(body.author)

			// Exist Author And Check His role must be Author
			if (checkAuthor && checkAuthor.role === 'AUTHOR') {
				console.log('\nRequest user is Admin with User Id\n>>>>')

				const storyParam = {
					...body,
					short_url,
					createdBy: requestUserId,
					author: checkAuthor._id
				}
				const story = new Story(storyParam)

				await story.save()
				res.status(200).json(successResponse(story, 'Successfully Story Created'))
				return
			}

			throw new Error('Author Id is Wrong')
		}
		// Else is Admin nor Author
		else {
			throw new Error('Permission is not allowed')
		}
	}
	catch(e) {
		res.status(400).json(errorResponse(e))
	}

}

/**
 * Get Story Count
 */
module.exports.STORY_COUNT = async (req, res) => {
	const count = await Story.countDocuments()
	res.status(200).json(successResponse(count, 'Count Stories'))
}

/**
 * UPDATE Story
 * @note : Request user may be ADMIN or AUTHOR
 * may be different logic
 */
module.exports.UPDATE_STORY = async (req, res) => {

	const { id = null } = req.params
	const { error: idError } = IS_VALID_ID(id)
	// Is Id Not Valid Error
	if (idError) {
		res.status(400).json(MANAGE_ERROR_MESSAGE(idError))
		return
	}

	const { error, value } = Story_Update_Validator(req)
	if (error) {
		res.status(400).json( MANAGE_ERROR_MESSAGE(error) )
		return
	}

	try {
		// If Story Not Found
		const existStory = await Story.findById(id)
		if (!existStory) { throw new Error('Story Not Found') }

		// If Okay
		const body = value
		const isAdmin = req.user.role === 'ADMIN'
		const isAuthor = req.user.role === 'AUTHOR'
		const requestUserRole= req.user.role

		// Check Request User Roles
		const allowedPermissionRoles = ['ADMIN', 'AUTHOR']
		if (!allowedPermissionRoles.includes(requestUserRole)) {
			throw new Error('Permission is not allowed for Request User Role.')
		}

		// If Request User is Author Case
		if (isAuthor) {
			console.log('\nRequest user is Author with Own Story\n>>>>')

			// Check is own story or not
			if (DEEP_JSON_COPY(existStory.author) !== DEEP_JSON_COPY(req.user._id)) {
				throw new Error('This is not your story. So you are not allowed to update story.')
			}

			const storyParam = { ...body }
			// If There is Other Attributes , had to delete
			// to be safe Process
			delete storyParam.addable_episode_count
			const updatedStory = await Story.findByIdAndUpdate(id, storyParam, {new: true})
			res.status(200).json(successResponse(updatedStory, 'Successfully Story Updated'))
			return
		}

		// If Request User is Admin Case
		else if (isAdmin) {
			console.log('\nAdmin Update story to Some author Story\n>>>>')

			const storyParam = { ...body }
			const updatedStory = await Story.findByIdAndUpdate(id, storyParam, {new: true})
			res.status(200).json(successResponse(updatedStory, 'Successfully Story Updated'))
		}
		// Else is Admin nor Author
		else {
			throw new Error('Permission is not allowed')
		}
	}
	catch(e) {
		res.status(400).json(errorResponse(e))
	}

}

/**
 * Get Story By Id
 *
 */
module.exports.GET_STORY_BY_ID = async (req, res) => {
	const { id = null } = req.params
	const { error: idError } = IS_VALID_ID(id)
	// Is Id Not Valid Error
	if (idError) {
		res.status(400).json(MANAGE_ERROR_MESSAGE(idError))
		return
	}

	try {
		const excludesValue = ['__v', 'createdAt', 'deletedAt', 'updatedAt', 'viwers', 'addable_episode_count']

		// If Story Not Found
		const existStory = await Story
			.findById(id)
			.select(excludesValue.map(txt => `-${txt}`).join(' '))

		if (!existStory) { throw new Error('Story Not Found') }

		const showUserData = 'name email image role'
		const data = await existStory
			.populate('author', showUserData)
			.populate('createdBy', showUserData)
			.execPopulate()

		data.image = `${process.env.BASE_URL}/${STORY_IMAGE_PATH}/${data.image}`
		data.createdBy.image = `${process.env.BASE_URL}/${USER_IMAGE_PATH}/${data.createdBy.image}`
		data.author.image = `${process.env.BASE_URL}/${USER_IMAGE_PATH}/${data.author.image}`


		res.status(200).json(successResponse(data, 'Successfully fetching story.'))

	}
	catch(e) {
		res.status(400).json(errorResponse(e))
	}
}

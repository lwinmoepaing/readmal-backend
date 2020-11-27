const short = require('short-uuid')
const uuid = require('uuid/v4')

const { MANAGE_ERROR_MESSAGE } = require('../../lib/helper')
const { errorResponse, successResponse } = require('../../lib/responseHandler')
const { Story_Create_Validator } = require('./StoryValidator')

const Story = require('./StoryModel')
const User = require('../User/UserModel')

module.exports.CREATE_STORY = async (req, res) => {
	const { error } = await Story_Create_Validator(req)

	if (error) {
		res.status(400).json( MANAGE_ERROR_MESSAGE(error) )
		return
	}

	try {
		const { body } = req
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

			const storyParam = {...body, short_url}

			// If There is Other Attributes , had to delete
			// to be safe Process
			delete storyParam.addable_episode_count
			delete storyParam.is_including_premium
			delete storyParam.author


			const story = new Story({
				...storyParam,
				author: req.user._id
			})

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

				const storyParam = {...body, short_url}
				const story = new Story({
					...storyParam,
					author: checkAuthor._id
				})

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

module.exports.STORY_COUNT = async (req, res) => {
	const count = await Story.countDocuments()
	res.status(200).json(successResponse(count, 'Count Stories'))
}

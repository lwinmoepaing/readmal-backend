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
		const isAdmin = req.user.role === 'ADMIN'
		const isAuthor = req.user.role === 'AUTHOR'

		// If Request User is Author Case
		if (isAuthor) {
			console.log('\nRequest user is Author with Own Story\n>>>>')
			const storyParam = {...body}

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
			res.status(200).json(successResponse(story, 'Successfully Story Created'))
			return
		}

		// If Request User is Admin Case
		else if (isAdmin) {
			const checkAuthor = await User.findById(body.author)

			// Exist Author And Check His role must be Author
			if (checkAuthor && checkAuthor.role === 'AUTHOR') {
				console.log('\nRequest user is Admin with User Id\n>>>>')
				const storyParam = {...body}
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

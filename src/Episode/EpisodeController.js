// const short = require('short-uuid')
// const uuid = require('uuid/v4')

const { MANAGE_ERROR_MESSAGE, DEEP_JSON_COPY, IS_VALID_ID } = require('../../lib/helper')
const { errorResponse, successResponse } = require('../../lib/responseHandler')


const User = require('../User/UserModel')
const Episode = require('./EpisodeModel')
const Story = require('../Story/StoryModel')

const { Episode_Create_Validator } = require('./EpisodeValidator')
const { EPISODE_IMAGE_PATH, USER_IMAGE_PATH } = require('../../config')

/**

/**
 * Create Story
 * @note : Request user may be ADMIN or AUTHOR
 * may be different logic
 */
module.exports.CREATE_EPISODE = async (req, res) => {

	const { id = null } = req.params
	const { error: idError } = IS_VALID_ID(id)
	// Is Id Not Valid Error
	if (idError) {
		res.status(400).json(MANAGE_ERROR_MESSAGE(idError))
		return
	}

	const { error, value } = Episode_Create_Validator(req)

	if (error) {
		res.status(400).json( MANAGE_ERROR_MESSAGE(error) )
		return
	}

	try {
		const story = await Story.findById(id)
		if (!story) throw new Error('Story Not Found')

		const body = value
		const isAdmin = req.user.role === 'ADMIN'
		const isAuthor = req.user.role === 'AUTHOR'
		const requestUserRole = req.user.role
		const requestUserId = req.user._id

		// Check Request User Roles
		const allowedPermissionRoles = ['ADMIN', 'AUTHOR']
		if (!allowedPermissionRoles.includes(requestUserRole)) {
			throw new Error('Permission is not allowed for Request User Role.')
		}

		// // If Request User is Author Case
		if (isAuthor) {

			// Check is own story or not
			if (DEEP_JSON_COPY(story.author) !== DEEP_JSON_COPY(req.user._id)) {
				throw new Error('This is not your story. So you are not allowed to add episode.')
			}

			console.log('\nRequest user is Author with Own Story\n>>>>')

			if (story.addable_episode_count <= 0) {
				throw new Error('You need to get package to make more episode. Limited Episode is gone.')
			}

			const episodeParam = {
				...body,
				story: story._id,
				author: requestUserId,
				episode_number: story.episodes.length + 1
			}

			const episode = new Episode(episodeParam)
			await episode.save()

			// Decrease Story Addable Episode Count
			// And Add Episdoe Id to Story
			await Story.findByIdAndUpdate(story._id, {
				addable_episode_count: story.addable_episode_count - 1,
				episodes: [...story.episodes, episode._id]
			})

			const data = await episode
				.populate('author', '_id name email image')
				.populate('story', '_id title description')
				.execPopulate()

			data.image = `${process.env.BASE_URL}/${EPISODE_IMAGE_PATH}/${data.image}`
			data.background_context_image = `${process.env.BASE_URL}/${EPISODE_IMAGE_PATH}/${data.background_context_image}`
			data.author.image = `${process.env.BASE_URL}/${USER_IMAGE_PATH}/${data.author.image}`

			res.status(200).json(successResponse( data, 'Successfully Episode Created'))
			return
		}

		// // If Request User is Admin Case
		else if (isAdmin) {
			const checkAuthor = await User.findById(body.author)

			// Exist Author And Check His role must be Author
			if (checkAuthor && checkAuthor.role === 'AUTHOR') {
				console.log('\nRequest user is Admin with User Id\n>>>>')

				const episodeParam = {
					...body,
					story: story._id,
					author: checkAuthor._id,
					episode_number: story.episodes.length + 1
				}

				const episode = new Episode(episodeParam)
				await episode.save()

				// Decrease Story Addable Episode Count
				// And Add Episdoe Id to Story
				await Story.findByIdAndUpdate(story._id, {
					episodes: [...story.episodes, episode._id]
				})
				const data = await episode
					.populate('author', '_id name email image')
					.populate('story', '_id title description')
					.execPopulate()

				data.image = `${process.env.BASE_URL}/${EPISODE_IMAGE_PATH}/${data.image}`
				data.background_context_image = `${process.env.BASE_URL}/${EPISODE_IMAGE_PATH}/${data.background_context_image}`
				data.author.image = `${process.env.BASE_URL}/${USER_IMAGE_PATH}/${data.author.image}`

				res.status(200).json(successResponse(data, 'Successfully Episode Created'))
				return
			}
			// Else is Admin nor Author
			throw new Error('Author Id is Wrong')
		}
	}
	catch(e) {
		res.status(400).json(errorResponse(e))
	}

}
// const short = require('short-uuid')
// const uuid = require('uuid/v4')

const { MANAGE_ERROR_MESSAGE, DEEP_JSON_COPY, IS_VALID_ID } = require('../../lib/helper')
const { errorResponse, successResponse } = require('../../lib/responseHandler')


const User = require('../User/UserModel')
const Episode = require('./EpisodeModel')
const Story = require('../Story/StoryModel')

const {
	Episode_Create_Validator,
	Episode_Update_Validator,
	Episode_Update_Context_Validator,
	Episode_Publish_Validator,
	Episode_Set_Premium_Validator
} = require('./EpisodeValidator')

const { EPISODE_IMAGE_PATH, USER_IMAGE_PATH } = require('../../config')

/**
 * GET Episode
 */
module.exports.GET_EPISODE_BY_ID = async (req, res) => {

	const { id = null } = req.params
	const { error: idError } = IS_VALID_ID(id)
	// Is Id Not Valid Error
	if (idError) {
		res.status(400).json(MANAGE_ERROR_MESSAGE(idError))
		return
	}

	try {
		const episode = await Episode.findById(id)
		if (!episode) {
			throw new Error('Episode is not found.')
		}

		const data = await episode
			.populate('author', '_id name email image rank')
			.populate(
				{
					path: 'story',
					select: '_id title description episodes',
					populate: {
						path: 'episodes',
						select: '_id title description episode_number is_premium'
					}
				}
			)
			.execPopulate()

		data.image = `${process.env.BASE_URL}/${EPISODE_IMAGE_PATH}/${data.image}`
		data.background_context_image = `${process.env.BASE_URL}/${EPISODE_IMAGE_PATH}/${data.background_context_image}`
		data.author.image = `${process.env.BASE_URL}/${USER_IMAGE_PATH}/${data.author.image}`

		res.status(200).json(successResponse( data, 'Successfully Episode Created'))
		return
	}
	catch(e) {
		res.status(400).json(errorResponse(e))
	}

}

/**
 * GET Episode Short Mode
 */
module.exports.GET_EPISODE_BY_ID_SHORT = async (req, res) => {

	const { id = null } = req.params
	const { error: idError } = IS_VALID_ID(id)
	// Is Id Not Valid Error
	if (idError) {
		res.status(400).json(MANAGE_ERROR_MESSAGE(idError))
		return
	}

	try {
		const excludeParams = [
			'__v',
			'addable_image_count',
			'addable_message_count',
			'is_editable',
			'deletedAt',
			'context',
			'snap_context',
			'first_time_context',
			'viwers'
		]

		const episode = await Episode
			.findById(id)
			.select(excludeParams.map(param => `-${param}`).join(' '))

		if (!episode) {
			throw new Error('Episode is not found.')
		}

		const data = await episode
			.populate('author', '_id name email image rank')
			.populate(
				{
					path: 'story',
					select: '_id title description episodes',
					populate: {
						path: 'episodes',
						select: '_id title description episode_number is_premium'
					}
				}
			)
			.execPopulate()

		data.image = `${process.env.BASE_URL}/${EPISODE_IMAGE_PATH}/${data.image}`
		data.background_context_image = `${process.env.BASE_URL}/${EPISODE_IMAGE_PATH}/${data.background_context_image}`
		data.author.image = `${process.env.BASE_URL}/${USER_IMAGE_PATH}/${data.author.image}`

		res.status(200).json(successResponse( data, 'Successfully Episode Created'))
		return
	}
	catch(e) {
		res.status(400).json(errorResponse(e))
	}

}


/**
 * Create Episode
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

		// If Request User is Author Case
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
				is_premium: story.is_including_premium ? true: false,
				story: story._id,
				author: requestUserId,
				episode_number: story.episodes.length + 1
			}

			// Default Image Set to Category Image
			if (!req.body.image) {
				episodeParam.image = `${story.category}.jpg`
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
				.populate('author', '_id name email image rank')
				.populate('story', '_id title description episodes')
				.execPopulate()

			data.image = `${process.env.BASE_URL}/${EPISODE_IMAGE_PATH}/${data.image}`
			data.background_context_image = `${process.env.BASE_URL}/${EPISODE_IMAGE_PATH}/${data.background_context_image}`
			data.author.image = `${process.env.BASE_URL}/${USER_IMAGE_PATH}/${data.author.image}`

			res.status(200).json(successResponse( data, 'Successfully Episode Created'))
			return
		}

		// If Request User is Admin Case
		else if (isAdmin) {
			const checkAuthor = await User.findById(body.author)

			// Exist Author And Check His role must be Author
			if (checkAuthor && checkAuthor.role === 'AUTHOR') {
				console.log('\nRequest user is Admin with User Id\n>>>>')

				const episodeParam = {
					...body,
					is_premium: story.is_including_premium ? true: false,
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
					.populate('author', '_id name email image rank')
					.populate('story', '_id title description episodes')
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

/**
 * Update Episode
 * @note : Request user may be ADMIN or AUTHOR
 * may be different logic
 */
module.exports.UPDATE_EPISODE = async (req, res) => {

	const { id = null } = req.params
	const { error: idError } = IS_VALID_ID(id)
	// Is Id Not Valid Error
	if (idError) {
		res.status(400).json( MANAGE_ERROR_MESSAGE(idError) )
		return
	}

	const { error, value } = Episode_Update_Validator(req)

	if (error) {
		res.status(400).json( MANAGE_ERROR_MESSAGE(error) )
		return
	}

	try {
		const episode = await Episode.findById(id)
		if (!episode) throw new Error('Episode Not Found')

		const body = value
		const isAdmin = req.user.role === 'ADMIN'
		const isAuthor = req.user.role === 'AUTHOR'
		const requestUserRole = req.user.role

		// Check Request User Roles
		const allowedPermissionRoles = ['ADMIN', 'AUTHOR']
		if (!allowedPermissionRoles.includes(requestUserRole)) {
			throw new Error('Permission is not allowed for Request User Role.')
		}

		// If Request User is Author Case
		if (isAuthor) {

			// Check is own story or not
			if (DEEP_JSON_COPY(episode.author) !== DEEP_JSON_COPY(req.user._id)) {
				throw new Error('This is not your story. So you are not allowed to add episode.')
			}

			console.log('\nRequest user is Author with Own Story\n>>>>')

			const episodeParam = {
				...body,
			}

			const episode = await Episode.findByIdAndUpdate(id, episodeParam, {new: true})

			const data = await episode
				.populate('author', '_id name email image rank')
				.populate('story', '_id title description episodes')
				.execPopulate()

			data.image = `${process.env.BASE_URL}/${EPISODE_IMAGE_PATH}/${data.image}`
			data.background_context_image = `${process.env.BASE_URL}/${EPISODE_IMAGE_PATH}/${data.background_context_image}`
			data.author.image = `${process.env.BASE_URL}/${USER_IMAGE_PATH}/${data.author.image}`

			res.status(200).json(successResponse( data, 'Successfully Episode Updated'))
			return
		}

		// If Request User is Admin Case
		else if (isAdmin) {
			console.log('\nRequest user is Admin with User Id\n>>>>')

			const episodeParam = {
				...body,
			}

			const episode = await Episode.findByIdAndUpdate(id, episodeParam, {new: true})

			const data = await episode
				.populate('author', '_id name email image rank')
				.populate('story', '_id title description episodes')
				.execPopulate()

			data.image = `${process.env.BASE_URL}/${EPISODE_IMAGE_PATH}/${data.image}`
			data.background_context_image = `${process.env.BASE_URL}/${EPISODE_IMAGE_PATH}/${data.background_context_image}`
			data.author.image = `${process.env.BASE_URL}/${USER_IMAGE_PATH}/${data.author.image}`

			res.status(200).json(successResponse(data, 'Successfully Episode Updated'))
			return
		}
	}
	catch(e) {
		res.status(400).json(errorResponse(e))
	}

}

/**
 * Update Context
 */
module.exports.UPDATE_CONTEXT = async (req, res) => {

	const { id = null } = req.params
	const { error: idError } = IS_VALID_ID(id)
	// Is Id Not Valid Error
	if (idError) {
		res.status(400).json( MANAGE_ERROR_MESSAGE(idError) )
		return
	}

	const { error, value } = Episode_Update_Context_Validator(req)
	if (error) {
		res.status(400).json( MANAGE_ERROR_MESSAGE(error) )
		return
	}

	try {
		const episode = await Episode.findById(id)
		if (!episode) throw new Error('Episode Not Found')

		const body = value
		const isAdmin = req.user.role === 'ADMIN'
		const isAuthor = req.user.role === 'AUTHOR'
		const requestUserRole = req.user.role

		// Check Request User Roles
		const allowedPermissionRoles = ['ADMIN', 'AUTHOR']
		if (!allowedPermissionRoles.includes(requestUserRole)) {
			throw new Error('Permission is not allowed for Request User Role.')
		}

		// If Request User is Author Case
		if (isAuthor) {

			// Check is own story or not
			if (DEEP_JSON_COPY(episode.author) !== DEEP_JSON_COPY(req.user._id)) {
				throw new Error('This is not your story. So you are not allowed to add episode.')
			}

			console.log('\nRequest user is Author with Own Story\n>>>>')

			const episodeParam = {
				...body,
			}

			const episode = await Episode.findByIdAndUpdate(id, episodeParam, {new: true})

			const data = await episode
				.populate('author', '_id name email image rank')
				.populate('story', '_id title description episodes')
				.execPopulate()

			data.image = `${process.env.BASE_URL}/${EPISODE_IMAGE_PATH}/${data.image}`
			data.background_context_image = `${process.env.BASE_URL}/${EPISODE_IMAGE_PATH}/${data.background_context_image}`
			data.author.image = `${process.env.BASE_URL}/${USER_IMAGE_PATH}/${data.author.image}`

			res.status(200).json(successResponse( data, 'Successfully Episode Updated'))
			return
		}

		// If Request User is Admin Case
		else if (isAdmin) {
			console.log('\nRequest user is Admin with User Id\n>>>>')

			const episodeParam = {
				...body,
			}

			const episode = await Episode.findByIdAndUpdate(id, episodeParam, {new: true})

			const data = await episode
				.populate('author', '_id name email image rank')
				.populate('story', '_id title description episodes')
				.execPopulate()

			data.image = `${process.env.BASE_URL}/${EPISODE_IMAGE_PATH}/${data.image}`
			data.background_context_image = `${process.env.BASE_URL}/${EPISODE_IMAGE_PATH}/${data.background_context_image}`
			data.author.image = `${process.env.BASE_URL}/${USER_IMAGE_PATH}/${data.author.image}`

			res.status(200).json(successResponse(data, 'Successfully Episode Updated'))
			return
		}
	}
	catch(e) {
		res.status(400).json(errorResponse(e))
	}

}

/**
 * Publish Episode
 */

module.exports.PUBLISH_EPISODE = async (req, res) => {

	const { id = null } = req.params
	const { error: idError } = IS_VALID_ID(id)
	// Is Id Not Valid Error
	if (idError) {
		res.status(400).json( MANAGE_ERROR_MESSAGE(idError) )
		return
	}

	const { error, value } = Episode_Publish_Validator(req)
	if (error) {
		res.status(400).json( MANAGE_ERROR_MESSAGE(error) )
		return
	}

	try {
		const episode = await Episode.findById(id)
		if (!episode) throw new Error('Episode Not Found')

		const body = value
		const isAdmin = req.user.role === 'ADMIN'
		const isAuthor = req.user.role === 'AUTHOR'
		const requestUserRole = req.user.role

		// Check Request User Roles
		const allowedPermissionRoles = ['ADMIN', 'AUTHOR']
		if (!allowedPermissionRoles.includes(requestUserRole)) {
			throw new Error('Permission is not allowed for Request User Role.')
		}

		// If Already Published
		if (episode.is_published) {
			throw new Error('Episode is already published.')
		}

		// At least 80 lines
		if (episode.context.length < 80 ) {
			throw new Error('There should be at least 80 line messages.')
		}

		// Greater Than Addable Message
		if (episode.context.length > episode.addable_message_count) {
			throw new Error('Message line is greater than Addable Message.')
		}

		const story = await Story.findById(episode.story)
			.populate('episodes', '_id is_premium author title description episode_number is_published')


		const previousStory = story.episodes.find(epi => epi.episode_number === (episode.episode_number - 1) )

		// console.log('episode.episode_number', episode.episode_number)
		// console.log('previousStory', previousStory)
		// console.log('previousStory.is_published', previousStory.is_published)

		if (
			episode.episode_number !== 1 &&
			previousStory &&
			previousStory.is_published === false
		) {
			throw new Error('You need to publish previous episode first.')
		}

		// If Request User is Author Case
		if (isAuthor) {

			// Check is own story or not
			if (DEEP_JSON_COPY(episode.author) !== DEEP_JSON_COPY(req.user._id)) {
				throw new Error('This is not your story. So you are not allowed to add episode.')
			}

			console.log('\nRequest user is Author with Own Story\n>>>>')

			const episodeParam = {
				...body,
				snap_context: episode.context,
				first_time_context: episode.context,
				is_editable: false
			}

			const updateEpisode = await Episode.findByIdAndUpdate(id, episodeParam, {new: true})

			const data = await updateEpisode
				.populate('author', '_id name email image rank')
				.populate('story', '_id title description episodes')
				.execPopulate()

			data.image = `${process.env.BASE_URL}/${EPISODE_IMAGE_PATH}/${data.image}`
			data.background_context_image = `${process.env.BASE_URL}/${EPISODE_IMAGE_PATH}/${data.background_context_image}`
			data.author.image = `${process.env.BASE_URL}/${USER_IMAGE_PATH}/${data.author.image}`

			res.status(200).json(successResponse( data, 'Successfully Episode Published'))
			return
		}

		// If Request User is Admin Case
		else if (isAdmin) {
			console.log('\nRequest user is Admin with User Id\n>>>>')

			const episodeParam = {
				...body,
				snap_context: episode.context,
				first_time_context: episode.context,
				is_editable: false
			}

			const updateEpisode = await Episode.findByIdAndUpdate(id, episodeParam, {new: true})

			const data = await updateEpisode
				.populate('author', '_id name email image rank')
				.populate('story', '_id title description episodes')
				.execPopulate()

			data.image = `${process.env.BASE_URL}/${EPISODE_IMAGE_PATH}/${data.image}`
			data.background_context_image = `${process.env.BASE_URL}/${EPISODE_IMAGE_PATH}/${data.background_context_image}`
			data.author.image = `${process.env.BASE_URL}/${USER_IMAGE_PATH}/${data.author.image}`

			res.status(200).json(successResponse(data, 'Successfully Episode Published'))
			return
		}
	}
	catch(e) {
		res.status(400).json(errorResponse(e))
	}

}

/**
 * SET Premium Episode
 */

module.exports.SET_PREMIUM_EPISODE = async (req, res) => {

	const { id = null } = req.params
	const { error: idError } = IS_VALID_ID(id)
	// Is Id Not Valid Error
	if (idError) {
		res.status(400).json( MANAGE_ERROR_MESSAGE(idError) )
		return
	}

	const { error, value } = Episode_Set_Premium_Validator(req)
	if (error) {
		res.status(400).json( MANAGE_ERROR_MESSAGE(error) )
		return
	}

	try {
		const episode = await Episode.findById(id)
		if (!episode) throw new Error('Episode Not Found')

		const body = value
		const isAdmin = req.user.role === 'ADMIN'
		const requestUserRole = req.user.role

		// Check Request User Roles
		const allowedPermissionRoles = ['ADMIN']
		if (!allowedPermissionRoles.includes(requestUserRole)) {
			throw new Error('Permission is not allowed for Request User Role.')
		}

		// If Already Premium
		if (episode.is_premium) {
			throw new Error('Episode is already premium.')
		}

		// If Request User is Admin Case
		if (isAdmin) {
			console.log('\nRequest user is Admin with User Id\n>>>>')

			const episodeParam = {
				...body,
			}

			const updateEpisode = await Episode.findByIdAndUpdate(id, episodeParam, {new: true})

			const data = await updateEpisode
				.populate('author', '_id name email image rank')
				.populate('story', '_id title description episodes')
				.execPopulate()

			data.image = `${process.env.BASE_URL}/${EPISODE_IMAGE_PATH}/${data.image}`
			data.background_context_image = `${process.env.BASE_URL}/${EPISODE_IMAGE_PATH}/${data.background_context_image}`
			data.author.image = `${process.env.BASE_URL}/${USER_IMAGE_PATH}/${data.author.image}`

			// Set Parent Story Is Including Premium
			await Story.findByIdAndUpdate(episode.story, {
				is_including_premium: true
			})

			res.status(200).json(successResponse(data, 'Successfully Episode Published'))
			return
		}
	}
	catch(e) {
		res.status(400).json(errorResponse(e))
	}

}

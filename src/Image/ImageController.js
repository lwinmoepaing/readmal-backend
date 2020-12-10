const Image = require('./ImageModel')
const User = require('../User/UserModel')

const { errorResponse, successResponse } = require('../../lib/responseHandler')
const { PAGINATE_LABELS } = require('../../config')

/**
 * GET ALL IMAGES
 */
module.exports.GET_ALL_IMAGES = async (req, res) => {
	const { page = 1 } = req.query
	const limit = 10
	const options = {
		select: '_id image createdBy',
		sort: { createdAt: -1 },
		page,
		limit,
		customLabels: PAGINATE_LABELS,
		populate: {
			path: 'createdBy', select: 'name role image'
		}
	}

	try {
		const users = await Image.paginate({}, options)
		res.status(200).json(users)
	} catch (e) {
		res.status(400).json(errorResponse(e))
	}
}


/**
 * Creating Image
 */
module.exports.CREATE_IMAGE = async (req, res) => {
	try {

		if( !req.file ) {
			throw new Error('Invalid File')
		}

		const path = req.query.path || 'profile'

		const imageFilePath = `${process.env.BASE_URL}/${path}/${req.file.filename}`

		const image = new Image({
			image: imageFilePath,
			createdBy: `${req.user._id}`,
			text: req.query.text || '',
			path: path,
		})

		await image.save()

		if (req.query.userId) {
			await User.findByIdAndUpdate(req.query.userId, {
				image: imageFilePath
			})
		}

		res.json(successResponse(image, 'Succesfully Uploaded'))
	} catch (e) {
		res.status(404).json(errorResponse(e))
	}
}

/**
 * GET Image By User
 */
module.exports.GET_IMAGE_BY_USER = async (req, res) => {
	const { page = 1 } = req.query
	const limit = 10
	const options = {
		select: '_id note url',
		sort: { createdAt: -1 },
		page,
		limit,
		customLabels: PAGINATE_LABELS,
	}
	const query = {
		user: req.user._id
	}

	try {
		const images = await Image.paginate( query, options)
		res.status(200).json(images)
	} catch(e) {
		res.status(400).json(errorResponse(e))
	}
}


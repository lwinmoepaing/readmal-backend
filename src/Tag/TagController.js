const Tag = require('./TagModel')

const { PAGINATE_LABELS } = require('../../config')
const { errorResponse, successResponse } = require('../../lib/responseHandler')

/**
 * Tag Lists
 */
module.exports.GET_ALL_TAGS = async (req, res) => {

	const { page = 1 } = req.query
	const limit = 10
	const options = {
		select: '_id name ',
		sort: { createdAt: -1 },
		page,
		limit,
		customLabels: PAGINATE_LABELS,
		populate: {
			path: 'blogs',
			select: 'title'
		}
	}

	const users = await Tag.paginate({}, options)
	res.status(200).json(users)
}


/**
 * Get Tag by ID
 */
module.exports.GET_TAG_BY_ID = async (req, res) => {
	try {
		const tag = await Tag.findById(req.params.id).select('_id name').populate('blogs', 'title')
		if(!tag) throw new Error ('Tag Not Found ')
		res.status(200).json(successResponse(tag))
	} catch (e) {
		res.status(400).json(errorResponse(e))
	}
}

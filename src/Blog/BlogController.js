const Blog = require('./BlogModel')
const { PAGINATE_LABELS, PAGINATE_LIMIT } = require('../../config')
const { successResponse, errorResponse } = require('../../lib/responseHandler')
const { BLOG_CREATE_VALIDATOR, BLOG_UPDATE_VALIDATOR } = require('./BlogValidator')
const { MANAGE_ERROR_MESSAGE, IS_VALID_ID, DEEP_JSON_COPY} = require('../../lib/helper')
const { EXISTING_OR_NEW_TAGS, CREATE_NEW_TAG_LIST } = require('../Tag/TagHelper')
const {
	SET_PAYLOAD_CREATE_BLOG,
	SET_PAYLOAD_UPDATE_BLOG_WITH_TAGS,
	BLOG_PAGINATE_OPTIONS,
	TAGS_WITH_BLOG,
	TAGS_WITH_BLOG_EMPTY } = require('./BlogHelper')
const Tag = require('../Tag/TagModel')

/**
 * Create Blog
 */
module.exports.CREATE_BLOG = async (req, res) => {

	const { error } = BLOG_CREATE_VALIDATOR(req)

	if(error) {
		res.status(400).json( MANAGE_ERROR_MESSAGE(error) )
		return
	}

	try {
		let tags = []
		if(req.body.tags) {
			const { existingTagsWithId, newTags } = await EXISTING_OR_NEW_TAGS(req.body.tags)
			const { newTagsWithId } = await CREATE_NEW_TAG_LIST(newTags)
			tags = [ ...existingTagsWithId, ...newTagsWithId]
		}

		const newBlog = new Blog(SET_PAYLOAD_CREATE_BLOG({ req, tags }))
		const saveNewBlog = await newBlog.save()
		res
			.status(200)
			.json(successResponse(
				await saveNewBlog
					.populate('author', 'name email image')
					.populate('tags', '_id name').execPopulate()
				, 'Succesfully Created Blog')
			)
	} catch (e) {
		res.status(400).json(errorResponse(e))
	}
}

/**
 * Edit Blog
 */
module.exports.UPDATE_BLOG_BY_ID = async (req, res) => {
	const { id = null } = req.params
	const { error: idError } = IS_VALID_ID(id)

	// Is Not Valid Error
	if (idError) {
		res.status(400).json(MANAGE_ERROR_MESSAGE(idError))
		return
	}

	// Is Project Update Error
	const {error, value} = await BLOG_UPDATE_VALIDATOR(req)
	if(error) {
		res.status(400).json(MANAGE_ERROR_MESSAGE(error))
		return
	}

	try {
		const blog = await Blog.findById(id)
		if(!blog) { throw new Error('Blog Not Found') }

		// If User Update [Own/Self Project]
		if(DEEP_JSON_COPY(blog.author) !== DEEP_JSON_COPY(req.user._id)) {
			throw new Error ('Not permission for this blog')
		}

		const payloads = await SET_PAYLOAD_UPDATE_BLOG_WITH_TAGS({blogId: id, body: value})

		if(payloads.body) {
			await Blog.findByIdAndUpdate(id, payloads.body)
		}

		const data = {
			...DEEP_JSON_COPY(await Blog.findById(id).populate('tags', 'name')),
		}
		res.status(200).json(successResponse(data, 'Successfully Updated'))
	} catch (e) {
		res.status(400).json(errorResponse(e))
	}
}

/**
 * Get All Blogs
 */
module.exports.GET_ALL_BLOG = async (req, res) => {
	const { page = 1, tag = '' } = req.query
	try {
		// If We got Tag Params we need to search with tags
		if(tag) {
			const tagsWithBlog = await Tag.findOne({name: tag})
			if(!tagsWithBlog) return res.status(200).json(TAGS_WITH_BLOG_EMPTY())
			return res.status(200).json(await TAGS_WITH_BLOG({tagName: tag, tagsWithBlog, page}))
		}
		const blogs = await Blog.paginate({}, BLOG_PAGINATE_OPTIONS(page))
		res.status(200).json(blogs)
	} catch (e) {
		res.status(400).json(errorResponse(e))
	}
}

/**
 * Get Blog By ID
 */
module.exports.GET_BLOG_BY_ID = async (req, res) => {
	const { error } = IS_VALID_ID(req.params.id)

	if (error) {
		res.status(400).json(MANAGE_ERROR_MESSAGE(error))
		return
	}

	try {
		const blog = await Blog
			.findById(req.params.id)
			.populate({
				path: 'author',
				select: 'name email phone role skills image'
			})
			.populate({
				path: 'tags',
				select: '_id name'
			})

		if(!blog) {
			throw new Error('Not Found Blog')
		}

		res.status(200).json(successResponse(blog))
	} catch (e) {
		res.status(400).json(errorResponse(e))
	}
}

/**
 * Get Blog By User Id
 */
module.exports.GET_BLOG_BY_USER_ID = async (req, res) => {
	const { userId = null } = req.params
	const { error } = IS_VALID_ID(userId)

	if (error) {
		res.status(400).json(MANAGE_ERROR_MESSAGE(error))
		return
	}

	const { page = 1 } = req.query
	const limit = PAGINATE_LIMIT
	const options = {
		sort: { createdAt: -1 },
		page,
		limit,
		customLabels: PAGINATE_LABELS,
		populate: {
			path: 'author',
			select: 'name email image'
		}
	}

	// Query Filters
	let query = { author: userId }
	try {
		const blog = await Blog.paginate(query, options)
		res.status(200).json(blog)
	} catch (e) {
		res.status(400).json(errorResponse(e))
	}
}

/**
 * Remove Blog By Id
 */
module.exports.DELETE_BLOG_BY_ID = async (req, res) => {
	const { id = null } = req.params
	const { error: idError } = IS_VALID_ID(id)

	// Is Not Valid Error
	if (idError) {
		res.status(400).json(MANAGE_ERROR_MESSAGE(idError))
		return
	}

	try {
		const blog = await Blog.findById(id)
		if(!blog) { throw new Error('Blog Not Found') }

		// If User Update [Own/Self Project]
		if(DEEP_JSON_COPY(blog.author) !== DEEP_JSON_COPY(req.user._id)) {
			throw new Error ('Not permission for this blog')
		}

		await Blog.findByIdAndRemove(id)

		try {
			const tagPromiseLists = blog.tags.map(tagId =>
				Tag.findByIdAndUpdate(tagId, {$pull: {blogs: id}})
			)
			await Promise.all(tagPromiseLists)
		} catch (e) {
			console.log(e)
		}

		res.status(200).json(successResponse(null, 'Successfully Deleted Blog'))
	} catch (e) {
		res.status(400).json(errorResponse(e))
	}
}




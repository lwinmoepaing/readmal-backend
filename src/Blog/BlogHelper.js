const Tag = require('../Tag/TagModel')
const { EXISTING_OR_NEW_TAGS, CREATE_NEW_TAG_LIST } = require('../Tag/TagHelper')
const { PAGINATE_LABELS, PAGINATE_LIMIT } = require('../../config')
const Blog = require('./BlogModel')

/**
 * @description: Manage Payload Before Creating new blog
 * @return {Object}
 */
module.exports.SET_PAYLOAD_CREATE_BLOG = ({req, tags}) => {
	return {
		title: req.body.title,
		description: req.body.description,
		headImg: '/images/blog_wallpaper.jpg',
		author: req.user._id,
		tags,
		type: 'Point',
		coordinates: [req.body.lat, req.body.lng],
		place_name: req.body.place_name || '',
		place_id: req.body.place_id || '',
		formatted_address: req.body.formatted_address || '',
	}
}

/**
 *	@param {ObjectId} blogId
 *	@param {Object} body "name | description | addedTags | removeTags"
 */
module.exports.SET_PAYLOAD_UPDATE_BLOG_WITH_TAGS = async ({blogId, body}) => {
	let addedTags = body.addedTags ? body.addedTags : []
	let removeTags = body.removeTags ? body.removeTags : []
	let isRemoveableTags = removeTags.length >= 0 ? true : false

	/**
	 * If Added Extra Tag
	 * @desc: we need to add Tag Model references
	 * @note body.addedTags propably be new(or)existing tags
	 * @doc https://docs.mongodb.com/manual/reference/operator/update/addToSet/
	 */
	if(body.addedTags) {
		try {
			const { existingTagsWithId, newTags } = await EXISTING_OR_NEW_TAGS(body.addedTags || [])
			const { newTagsWithId } = await CREATE_NEW_TAG_LIST(newTags)

			// We Attach Blogs to Tag list
			addedTags = [...existingTagsWithId, ...newTagsWithId]

			const tagPromiseLists = addedTags.map(id =>
				Tag.findByIdAndUpdate(id, {$addToSet: {blogs: blogId}})
			)
			await Promise.all(tagPromiseLists)
			// We Attach to Added TagList to Blog
			await Blog.findByIdAndUpdate(blogId, {$addToSet: {tags: addedTags}})

		} catch (e) {
			console.log('Added Extra Tag', e)
		}
	}

	/**
	 * If Removed Existing Tags
	 * @desc: we need to remove Tag Model references
	 * @note body.removeTags always be existing tags
	 * @doc https://docs.mongodb.com/manual/reference/operator/update/pullAll/
	 */
	if(isRemoveableTags) {
		// If We can remove bcoz RemoveTags Lenght is more than 1
		try {
			const { existingTagsWithId } = await EXISTING_OR_NEW_TAGS(body.removeTags || [])
			// We added tags list to update new Blogs
			removeTags = [...existingTagsWithId]

			const tagPromiseLists = removeTags.map(id =>{
				// Remove {pull} method'll work on it
				return Tag.findByIdAndUpdate(id, { $pull: { blogs: blogId }}, {safe: true})
			})
			await Promise.all(tagPromiseLists)
			// We Attach to Removed TagList to Blog
			await Blog.findByIdAndUpdate(blogId, {$pullAll: {tags: removeTags}})
		} catch (e) {
			console.log('Remove Existing', e)
		}
	}

	/**
	 * We need to sperate
	 * @desc: Specific Body from Tags
	 */
	delete body.addedTags
	delete body.removeTags
	const payloads = {
		...body,
		coordinates: [body.lat, body.lng]
	}

	return {
		body: payloads,
		addedTags,
		removeTags,
	}
}

/**
 * Search Blogs With Tag Input Search
 */
module.exports.TAGS_WITH_BLOG = async ({tagName, tagsWithBlog, page}) => {
	const itemCount = tagsWithBlog.blogs.length
	const perPage = PAGINATE_LIMIT
	page = +page
	const skip = page <= 1 ? 0 : (page - 1) * perPage
	const totalPage = Math.ceil(itemCount/perPage)
	const populateData = await Tag.findOne({name: tagName}).populate([
		{
			path: 'blogs',
			options: {
				sort: { createdAt: -1},
				skip: skip,
				limit : perPage
			},
			populate : {
				path : 'tags',
				select: '_id name'
			}
		},

	])
	const data = populateData.blogs
	return {
		data,
		meta: {
			itemCount,
			perPage,
			pageCount: parseInt(totalPage),
			currentPage: parseInt(page),
			serialNumber: 1,
			hasPrevPage: page >= totalPage,
			hasNextPage: page < totalPage,
			prevPage: page >= totalPage ? page - 1 : null,
			nextPage: page < totalPage ? page + 1 : null
		}
	}
}

module.exports.TAGS_WITH_BLOG_EMPTY = () => {
	return {
		data: [],
		meta: {
			itemCount: 0,
			perPage: 8,
			pageCount: 0,
			currentPage: 0,
			serialNumber: 0,
			hasPrevPage: false,
			hasNextPage: true,
			prevPage: null,
			nextPage: 2
		}
	}
}

/**
 * Blog Pagination Options
 * @param {Number} page is default "1" that mean initial perpage
 * @return {JSON}
 */
module.exports.BLOG_PAGINATE_OPTIONS = (page = 1) => ({
	select: '_id title description headImg',
	sort: { createdAt: -1 },
	page,
	limit: PAGINATE_LIMIT,
	customLabels: PAGINATE_LABELS,
	populate:[
		{
			path: 'author',
			select: 'name email image'
		},
		{
			path: 'tags',
			select: '_id name'
		}
	]
})


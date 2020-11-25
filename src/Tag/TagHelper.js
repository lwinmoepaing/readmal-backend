const Tag = require('./TagModel')

/**
 * Existing tags or New Tags
 * @description: We isolate existing tags or new tags with id
 * @param {[String]} tags
 * @returns {JSON}
 */
module.exports.EXISTING_OR_NEW_TAGS = async (tags) => {
	let tagLists = tags.map(tag => Tag.findOne({ name: tag }))
	tagLists = await Promise.all(tagLists.map(tag => tag.exec()))

	const existingTags = tagLists.filter(tag => tag !== null)
	const existingTagsName = existingTags.map(tag => tag.name)
	const existingTagsWithId = existingTags.map(tag => tag._id)
	const newTags = tags.filter(tag => !existingTagsName.includes(tag))

	return {
		existingTagsName,
		existingTagsWithId,
		newTags
	}
}

/**
 * Create new tags
 * @description: If Tag list is new, we'll create this
 * @param {[String]} tags
 * @return {JSON}
 */
module.exports.CREATE_NEW_TAG_LIST = async (tags) => {
	let tagLists = await Tag.insertMany(tags.map(tag => ({name: tag})))
	const newTagsName = tagLists.map(tag => tag.name)
	const newTagsWithId = tagLists.map(tag => tag._id)

	return {
		newTagsName,
		newTagsWithId,
	}
}

/**
 * Check And Put Blog
 * @description: If Tag list is new, we'll create this
 * @param {[String]} tags
 * @return {JSON}
 */
module.exports.CHECK_AND_PUT_BLOG = async (tags) => {
	let tagLists = await Tag.insertMany(tags.map(tag => ({name: tag})))
	const newTagsName = tagLists.map(tag => tag.name)
	const newTagsWithId = tagLists.map(tag => tag._id)

	return {
		newTagsName,
		newTagsWithId,
	}
}

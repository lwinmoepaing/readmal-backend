const { ObjectId } = require('mongoose').mongo
const Story = require('../src/Story/StoryModel')

module.exports = async () => {

	const stories = [
		{
			_id: ObjectId('5fc0ad0280383843b843ab2e'),
			short_url: '1H1i8VapKKzFtWqKbvRYJg',
			category: 'Horror',
			title: 'First Story !!',
			image: 'story.jpg',
			author: ObjectId('5fbff7edc2f87522b43f3787'), // Mg Author (author@gmail.com)
			createdBy: ObjectId('5fbff7edc2f87522b43f3785') // Admin (lwinmoepaong007@gmail.com)
		}
	]

	const StoryPromise = stories.map(story => Story.findOneOrCreate({ _id: story._id}, story))

	Promise.all(StoryPromise)
}


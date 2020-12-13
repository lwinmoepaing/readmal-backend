const faker = require('faker')
const { ObjectId } = require('mongoose').mongo
const Story = require('../src/Story/StoryModel')
const uuid = require('uuid/v4')

const Episode = require('../src/Episode/EpisodeModel')
const { Character } = require('../src/Episode/EpisodeHelper')

module.exports = async () => {

	const author_id = ObjectId('5fbff7edc2f87522b43f3787')
	const story_id = ObjectId('5fc0ad0280383843b843ab2e')
	const new_episode_id = ObjectId('5fc22a23c5986a3940ffea79')

	const stories = [
		{
			_id: story_id,
			short_url: '1H1i8VapKKzFtWqKbvRYJg',
			category: 'Horror',
			title: 'First Story !!',
			description: 'Some Description -- 1',
			image: 'story.jpg',
			addable_episode_count: 2,
			author: author_id, // Mg Author (author@gmail.com)
			createdBy: ObjectId('5fbff7edc2f87522b43f3785'), // Admin (lwinmoepaong007@gmail.com)
			episodes: [ObjectId('5fc131e005ab424dcc75479d'), new_episode_id, '5fc23cf394566d45f42820ff'], // First Episode
		}
	]

	const StoryPromise = stories.map(story => Story.findOneOrCreate({ _id: story._id}, story))

	const characters = [
		new Character('1', 'Mg Mg'),
		new Character('2', 'Aye Aye', '#ff7675'),
		new Character('3', 'Tun Tun', '#fdcb6e')
	]

	const makeContext = (length = 10) => Array.from({ length },() => ({
		id: uuid(),
		type: 'MESSAGE',
		message: faker.lorem.words(8),
		context_position: ['LEFT', 'RIGHT'][getRandomInt(0, 1)],
		is_theme_change: false,
		character: characters[getRandomInt(0, 2)]
	}))

	const contextOne = makeContext(100)
	const contextTwo = makeContext(20)
	const contextThree = makeContext(80)

	const episodes = [
		{
			_id: ObjectId('5fc131e005ab424dcc75479d'),
			title: 'Seed Episode oNE',
			author: author_id,
			story: story_id,
			episode_number: 1,
			context: contextOne,
			snap_context: contextOne,
			first_time_context: contextOne
		},
		{
			_id: new_episode_id,
			title: 'Seed Episode tWO',
			author: author_id,
			story: story_id,
			episode_number: 2,
			context: contextTwo,
			snap_context: contextTwo,
			first_time_context: contextTwo
		},
		{
			_id: '5fc23cf394566d45f42820ff',
			title: 'Seed Episode 3',
			author: author_id,
			story: story_id,
			episode_number: 3,
			context: contextThree,
			snap_context: contextThree,
			first_time_context: contextThree
		},
	]

	const EpisodePromise = episodes.map(episode => Episode.findOneOrCreate({ _id: episode._id}, episode))

	// console.log(JSON.stringify(episodes, null, 2))

	Promise.all([...StoryPromise, ...EpisodePromise])
}

function getRandomInt(min, max) {
	min = Math.ceil(min)
	max = Math.floor(max) + 1
	return Math.floor(Math.random() * (max - min) + min) //The maximum is exclusive and the minimum is inclusive
}

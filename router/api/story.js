const express = require('express')
const router = express.Router()

// Importing Controllers
const StoryController = require('../../src/Story/StoryController')

// Importing Middlewares
const isAuthMiddleware = require('../../middleware/isAuthMiddleware')

/**
 * @doc : Create Story
 * @desc : Using Middlware JWT to Authenticate
 * @route /api/v{Num}/story/
 */
router.post('/', isAuthMiddleware, StoryController.CREATE_STORY)

/**
 * @doc : Get Story By Id
 * @desc : Using Middlware JWT to Authenticate
 * @route /api/v{Num}/story/count
 */
router.get('/:id', StoryController.GET_STORY_BY_ID)

/**
 * @doc : Update Story
 * @desc : Using Middlware JWT to Authenticate
 * @route /api/v{Num}/story/count
 */
router.put('/:id', isAuthMiddleware, StoryController.UPDATE_STORY)

/**
 * @doc : Count Story
 * @desc : Using Middlware JWT to Authenticate
 * @route /api/v{Num}/story/count
 */
router.get('/count', StoryController.STORY_COUNT)

module.exports = router

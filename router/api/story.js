const express = require('express')
const router = express.Router()

// Importing Controllers
const StoryController = require('../../src/Story/StoryController')

// Importing Middlewares
const isAuthMiddleware = require('../../middleware/isAuthMiddleware')

/**
 * @doc : Create Story
 * @desc : Using Middlware JWT to Authenticate
 * @route /api/v{Num}/image/
 */
router.post('/', isAuthMiddleware, StoryController.CREATE_STORY)

module.exports = router

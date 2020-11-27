const express = require('express')
const router = express.Router()

const EpisodeController = require('../../src/Episode/EpisodeController')

// Importing Middlewares
const isAuthMiddleware = require('../../middleware/isAuthMiddleware')

/**
 * @doc : Add New Episode to Story
 * @desc : Using Middlware JWT to Authenticate
 * @route /api/v{Num}/episode/to-story/{story_id}
 */
router.post('/to-story/:id', isAuthMiddleware, EpisodeController.CREATE_EPISODE)

module.exports = router

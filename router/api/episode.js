const express = require('express')
const router = express.Router()

const EpisodeController = require('../../src/Episode/EpisodeController')

// Importing Middlewares
const isAuthMiddleware = require('../../middleware/isAuthMiddleware')

/**
 * @doc : Add New Episode to Story
 * @desc : Using Middlware JWT to Authenticate
 * @route /api/v{Num}/episode/to-story/{story_id}
 * @method POST
 */
router.post('/to-story/:id', isAuthMiddleware, EpisodeController.CREATE_EPISODE)

/**
 * @doc : Update Episode
 * @desc : Using Middlware JWT to Authenticate
 * @route /api/v{Num}/episode/{id}
 * @method PUT
 */
router.put('/:id', isAuthMiddleware, EpisodeController.UPDATE_EPISODE)

/**
 * @doc : GET Episode
 * @desc : Using Middlware JWT to Authenticate
 * @route /api/v{Num}/episode/{id}
 * @method GET
 */
router.get('/:id', isAuthMiddleware, EpisodeController.GET_EPISODE_BY_ID)

/**
 * @doc : GET Episode by short
 * @note : You Don't Need To Authenticate
 * @route /api/v{Num}/episode/{id}
 * @method GET
 */
router.get('/:id/short', EpisodeController.GET_EPISODE_BY_ID_SHORT)


module.exports = router

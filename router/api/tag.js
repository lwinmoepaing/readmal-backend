const express = require('express')
const router = express.Router()

// Importing Controllers
const TagController = require('../../src/Tag/TagController')

// Imorting Middlewares
const isAuthMiddleware = require('../../middleware/isAuthMiddleware')

/**
 * Get All Tags
 * @desc : Using Middlware JWT to Authenticate
 * @route /api/v{Num}/tag/
 */

router.get('/', isAuthMiddleware, TagController.GET_ALL_TAGS)

/**
 * Get Tag By Id
 * @desc : Using Middlware JWT to Authenticate
 * @route /api/v{Num}/tag/{tagId}
 */

router.get('/:id', isAuthMiddleware, TagController.GET_TAG_BY_ID)

module.exports = router

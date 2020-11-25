const express = require('express')
const router = express.Router()

// Importing Controllers
const ImageController = require('../../src/Image/ImageController')

// Importing Middlewares
const { passUpload } = require('../../middleware/imageUpload')
const isAuthMiddleware = require('../../middleware/isAuthMiddleware')

/**
 * @doc : Get User Profile
 * @desc : Using Middlware JWT to Authenticate
 * @route /api/v{Num}/image/
 */
router.post('/', isAuthMiddleware, passUpload, ImageController.CREATE_IMAGE
)

/**
 * @doc : Get User Profile
 * @desc : Using Middlware JWT to Authenticate
 * @route /api/v{Num}/image/
 */
router.get('/', isAuthMiddleware, ImageController.GET_ALL_IMAGES
)

/**
 * @doc : Get Images By User Jwt
 * @desc : Using Middlware JWT to Authenticate
 * @route /api/v{Num}/image/user
 */
router.get('/user', isAuthMiddleware, ImageController.GET_IMAGE_BY_USER
)

module.exports = router

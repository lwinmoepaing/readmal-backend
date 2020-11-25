const express = require('express')
const router = express.Router()

// Importing Controllers
const BlogController = require('../../src/Blog/BlogController')

// Imorting Middlewares
const isAuthMiddleware = require('../../middleware/isAuthMiddleware')

/**
 * Create Blog
 * @desc : Using Middlware JWT to Authenticate
 * @route /api/v{Num}/image/
 */
router.post('/', isAuthMiddleware, BlogController.CREATE_BLOG)
router.put('/:id', isAuthMiddleware, BlogController.UPDATE_BLOG_BY_ID)
router.delete('/:id', isAuthMiddleware, BlogController.DELETE_BLOG_BY_ID)

/**
 * Get All Blogs
 */
router.get('/', BlogController.GET_ALL_BLOG)
router.get('/:id', BlogController.GET_BLOG_BY_ID)

/**
 * Get Blogs By User Id
 */
router.get('/user/:userId', BlogController.GET_BLOG_BY_USER_ID)

module.exports = router

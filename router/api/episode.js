const express = require('express')
const router = express.Router()

// Importing Middlewares
const isAuthMiddleware = require('../../middleware/isAuthMiddleware')

/**
 * @doc : Create Story
 * @desc : Using Middlware JWT to Authenticate
 * @route /api/v{Num}/story/
 */
router.post('/', isAuthMiddleware, (req, res) => {
	res.status(200).json({
		success: true,
		message: 'Get All Episodes'
	})
})

module.exports = router

const express = require('express')
const router = express.Router()

// Importing Controller
const AuthController = require('../../src/Auth/AuthController')
const isAuthMiddleware = require('../../middleware/isAuthMiddleware')


/**
 * @desc : to Login from User Request
 * @route /api/v{Num}/auth/login
 */

router.post('/login', AuthController.LOGIN_USER)

/**
 * Get User Profile
 * @desc : Using Middlware JWT to Authenticate
 * @route /api/v{Num}/auth/me
 */

router.get('/me', isAuthMiddleware, AuthController.GET_PROFILE_DATA)

/**
 * @desc : Create User
 * @route /api/v{Num}/auth/
 */

router.post('/', AuthController.CREATE_USER)

module.exports = router

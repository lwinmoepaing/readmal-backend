const express = require('express')
const router = express.Router()

// Importing Controller
const AuthController = require('../../src/Auth/AuthController')
const isAuthMiddleware = require('../../middleware/isAuthMiddleware')
const passport = require('passport')


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

/**
 * Login With Social
 * Example, Facebook, Twitter,
 */
router.get('/social/facebook',
	passport.authenticate('facebook',{ scope: ['public_profile', 'email'] })
)

// successRedirect : process.env.API_URL + '/' + 'successLogin',


router.get('/social/facebook/callback',
	passport.authenticate('facebook', {
		session: false,
		failureRedirect: '/404',
	}),
	AuthController.LOGIN_WITH_FACEBOOK_CALLBACK)

router.get('/successLogin', AuthController.LOGIN_WITH_FACEBOOK)

module.exports = router

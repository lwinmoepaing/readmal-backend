const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.join(__dirname, '../.env') })

// const env = process.env.NODE_ENV || 'development'
const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret'
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost/readmal'

/**
 * Roles mean Auth'roles
 * @constant {['AUTHOR', 'USER', 'PREMIUM_USER', 'PREMIUM_AUTHOR', 'ADMIN']} enum
 */
const ROLES = ['AUTHOR', 'USER', 'PREMIUM_USER', 'PREMIUM_AUTHOR', 'ADMIN']

/**
 * RelationShip State
 * @constant {['Single', 'In a relationship', 'Married', 'It\'s a complicated']}
 */
const RELATIONSHIP_STATE = ['Single', 'In a relationship', 'Married', 'It\'s a complicated']

/**
 * Custom Paginate Labels with Mongoose-Paginate-V2
 * @doc : https://github.com/aravindnc/mongoose-paginate-v2#with-custom-return-labels
 */
const PAGINATE_LABELS =  {
	totalDocs: 'itemCount',
	docs: 'data',
	limit: 'perPage',
	page: 'currentPage',
	totalPages: 'pageCount',
	pagingCounter: 'serialNumber',
	meta: 'meta'
}


module.exports = {
	API_VERSION: '/api/v1',
	API_KEY: process.env.API_KEY,
	JWT_SECRET,
	MONGO_URI,
	ROLES,
	RELATIONSHIP_STATE,
	PAGINATE_LABELS,
	PAGINATE_LIMIT: 8
}

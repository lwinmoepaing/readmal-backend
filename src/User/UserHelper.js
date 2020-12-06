const PACKAGE_NAME_LIST = {
	MONTHLY_SUBSCRIBE: {
		description: 'User have access 30days and can read normal stories. Expired Date\'ll appear in user profile setting.',
		amount: 1000,
	},
	MONTHLY_PREMIUM_SUBSCRIBE: {
		description: 'User have access 30days and can read both normal and premium stories.',
		amount: 3000,
	},
	MONTHLY_AUTHOR_SUBSCRIBE: {
		description: 'Author have access 30days (More create stories, and have episodes). Can edit publiced story.'
	}
}

module.exports.PACKAGE_NAME_LIST = PACKAGE_NAME_LIST

module.exports.PACKAGES = ['MONTHLY_SUBSCRIBE', 'MONTHLY_PREMIUM_SUBSCRIBE', 'MONTHLY_AUTHOR_SUBSCRIBE']

module.exports.Package = class Package {
	constructor(packageName, expiredAt = Date.now()) {
		this.name = packageName
		this.description = PACKAGE_NAME_LIST[packageName].description
		this.expiredAt = expiredAt
	}
}

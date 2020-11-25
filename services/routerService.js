const fs = require('fs')
const config = require('../config')

/**
 * @desc:
 * @param {app} express_app callback
 */
module.exports = (app) => {
	const apiRouterFiles = fs.readdirSync(__dirname + '/../router/api')
	apiRouterFiles.forEach(route => {
		const extensionJs = getExtension(route)
		if(extensionJs === 'js') {
			app.use(`${config.API_VERSION}/${route.split('.')[0]}`, require(`../router/api/${route}`))
		}
	})

	const webRouterFiles = fs.readdirSync(__dirname + '/../router/web')
	webRouterFiles.forEach(route => {
		const extensionJs = getExtension(route)
		if(extensionJs === 'js') {
			app.use(`/${route.split('.')[0]}`, require(`../router/web/${route}`))
		}
	})
}

function getExtension(route) {
	return route.split('.')[route.split('.').length - 1]
}

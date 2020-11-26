const fs = require('fs')

/**
 * @desc:
 * @param {app} express_app callback
 */
module.exports = () => {
	const apiRouterFiles = fs.readdirSync(__dirname + '/../seed')
	console.log('>>>>>>>>>>>__>>>>>>>>>>>>')
	console.log('Calling Seeder Service')
	console.log('>>>>>>>>>>>__>>>>>>>>>>>> \n')

	apiRouterFiles.forEach( (route, index) => {
		const extensionJs = getExtension(route)
		if (extensionJs === 'js') {
			console.log(`[${index+1}]-> ${route} is calling.`)
			require('../seed/'+route)()
		}
	})

	console.log('\n')
}

function getExtension(route) {
	return route.split('.')[route.split('.').length - 1]
}

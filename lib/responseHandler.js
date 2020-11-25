module.exports = {
	successResponse (data, message = 'Success') {
		const response = {
			message,
			data
		}
		return response
	},
	errorResponse (error, data = null) {
		const { message = null } = error
		const errorResponse = {
			errorCode: 1,
			message,
			data
		}
		return errorResponse
	}
}

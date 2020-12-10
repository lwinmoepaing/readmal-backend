const multer = require('multer')
const path = require('path')
const uuidv4 = require('uuid/v4')
const short = require('short-uuid')
const moment = require('moment')

const { errorResponse } = require('../lib/responseHandler')

const { MANAGE_ERROR_MESSAGE } = require('../lib/helper')
const { Image_Validator } = require('../src/Image/ImageValidator')

const storage = (customPath = 'profile') => {
	return multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, `${__dirname}/../public/` + customPath)
		},
		filename: function (req, file, cb) {
			const id = short.generate(uuidv4())
			const ext = path.extname(file.originalname)
			const date =  moment().format('YYYY_MM_DD').toString()
			const fileName = `${customPath}_${date}_${id}${ext}`
			cb(null, fileName)
		}
	})
}

const fileFilter = (req, file, cb) => {
	if (
		!file.mimetype.includes('jpeg') &&
		!file.mimetype.includes('jpg') &&
		!file.mimetype.includes('png') ) {
		return cb(null, false, new Error('Only images are allowed'))
	} else {
		cb(null, true)
	}
}


module.exports.passUpload = (req, res, next) => {
	// Image ValidateTing
	const { error } = Image_Validator(req)

	if (error) {
		res.status(400).json( MANAGE_ERROR_MESSAGE(error) )
		return
	}

	const upload = multer(
		{
			storage: storage(req.query.path || 'profile'),
			limits: {
				fileSize: 1024 * 1024
			},
			fileFilter
		}
	).single('image')

	upload (req, res, async (err) => {
		try {
			if (err instanceof multer.MulterError) {
				// A Multer error occurred when uploading.
				if (err.code === 'LIMIT_FILE_SIZE') throw new Error('Your image is larger than 1mb')
				throw new Error (err.message ? err.message : 'Something Wrong When Uploading')
			} else if (err) {
				// An unknown error occurred when uploading.
				throw err
			}

			next()
		} catch (e) {
			res.status(400).json(errorResponse(e))
		}

	})

}

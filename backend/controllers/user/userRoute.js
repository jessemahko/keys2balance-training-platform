const router = require('express').Router()
const userController = require('./userController')
const middleware = require('../../utils/middleware')

router.get('/me', middleware.userExtractor, userController.getMe)

router.get('/', middleware.authorizeRoles('admin'), userController.getUsers)
router.post('/', middleware.authorizeRoles('admin'), userController.createUser)

module.exports = router
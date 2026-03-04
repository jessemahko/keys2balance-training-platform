const router = require('express').Router()
const userController = require('./userController')
const middleware = require('../../utils/middleware')

router.get('/me', userController.getMe)

router.get('/', middleware.authorizeRoles('admin'), userController.getUsers)
router.get('/email/:email', middleware.authorizeRoles('admin'), userController.getUserByEmail)
router.get('/username/:username', middleware.authorizeRoles('admin'), userController.getUserByUsername)
router.post('/', middleware.authorizeRoles('admin'), userController.createUser)

module.exports = router
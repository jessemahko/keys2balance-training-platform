const router = require('express').Router()
const userController = require('./userController')
const middleware = require('../../utils/middleware')

router.get(
	'/me',
	middleware.tokenExtractor,
	middleware.userExtractor,
	userController.getCurrentUserProfile,
)

router.put(
	'/me',
	middleware.tokenExtractor,
	middleware.userExtractor,
	userController.updateCurrentUserProfile,
)
router.get('/', userController.getUsers)
router.post('/', userController.createUser)
router.put('/:id', userController.updateUserPassword)
router.delete('/:id', userController.deleteUser)

module.exports = router

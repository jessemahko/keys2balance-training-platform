const router = require('express').Router()
const userController = require('../user/userController')

router.get('/me', userController.getCurrentUserProfile)
router.put('/me', userController.updateCurrentUserProfile)

module.exports = router
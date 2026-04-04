const router = require('express').Router()
const userController = require('./userController')

router.get('/', userController.getUsers)
router.post('/', userController.createUser)
router.put('/:id', userController.updateUserPassword)
router.put('/:id/role', userController.updateUserRole)
router.delete('/:id', userController.deleteUser)

module.exports = router

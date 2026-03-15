const router = require('express').Router()
const AccessCodeController = require('./accessCodeController')
router.get('/', AccessCodeController.getAllAccessCodes)
router.post('/', AccessCodeController.createAccessCode)
router.delete('/:id', AccessCodeController.deleteAccessCode)
module.exports = router


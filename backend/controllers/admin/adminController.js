const router = require('express').Router()
const User = require('../../models/user')

router.get('/users', async (req,res) => {
	const users = await User.findAll()
	res.json(users)
})

module.exports = router

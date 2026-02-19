const express = require('express')
const router = express.Router()
const { tokenExtractor, userExtractor, authorizeRoles } = require('../../utils/middleware')
const User = require('../../models/user')

router.get(
  '/users',
  tokenExtractor,
  userExtractor,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const users = await User.findAll()
      res.json(users)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
)

module.exports = router

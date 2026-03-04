const User = require('../../models/user')

// GET /api/user/me
const getMe = async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })

  const me = await User.findById(req.user.id)
  if (!me) return res.status(404).json({ error: 'User not found' })

  res.json(me)
}

// Admin: GET /api/user
const getUsers = async (req, res) => {
  const users = await User.findAll()
  res.json(users)
}

// Admin: POST /api/user
const createUser = async (req, res) => {
  const { username, email, passwordHash, role, cohorts, name } = req.body

  if (!username || !email || !passwordHash) {
    return res.status(400).json({
      error: 'username, email, passwordHash are required',
    })
  }

  const trimmedUsername = typeof username === 'string' ? username.trim() : ''
  const trimmedEmail = typeof email === 'string' ? email.trim() : ''

  if (!trimmedUsername || !trimmedEmail) {
    return res.status(400).json({ error: 'username/email cannot be empty' })
  }

  const exists = await User.findByUsernameOrEmail(trimmedUsername, trimmedEmail)
  if (exists) return res.status(400).json({ error: 'username or email already exists' })

  const created = await User.createUser({
    username: trimmedUsername,
    email: trimmedEmail,
    passwordHash,
    role,
    cohorts,
    name,
  })

  res.status(201).json(created)
}

module.exports = {
  getMe,
  getUsers,
  createUser,
}
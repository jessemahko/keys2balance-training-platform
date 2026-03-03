const router = require("express").Router()
const userModel = require("../../models/user")

// test GET /api/user/info
router.get("/info", async (req, res) => {
  res.status(200).json({ message: `Access granted for user: ${req.user.username}` })
})

// Admin: GET /api/user  
router.get("/", async (req, res) => {
  const users = await userModel.findAll()
  res.json(users)
})

//  GET /api/user/email/:email  
router.get("/email/:email", async (req, res) => {
  const user = await userModel.findByEmail(req.params.email)
  if (!user) return res.status(404).json({ error: "User not found" })
  res.json(user)
})

// GET /api/user/username/:username  
router.get("/username/:username", async (req, res) => {
  const user = await userModel.findByUsername(req.params.username)
  if (!user) return res.status(404).json({ error: "User not found" })
  res.json(user)
})

//  POST /api/user  set up users
router.post("/", async (req, res) => {
  const { username, email, passwordHash, role, cohorts } = req.body

  if (!username || !email || !passwordHash) {
    return res.status(400).json({ error: "username, email, passwordHash are required" })
  }

  const exists = await userModel.findByUsernameOrEmail(username, email)
  if (exists) return res.status(400).json({ error: "username or email already exists" })

  const created = await userModel.createUser({ username, email, passwordHash, role, cohorts })
  res.status(201).json(created)
})

module.exports = router
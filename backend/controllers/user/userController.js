const router = require('express').Router()

router.get('/info', async (req, res) => {
    try {
        res.status(200).json({ message: `Access granted for user: ${req.user.username}` })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

module.exports = router
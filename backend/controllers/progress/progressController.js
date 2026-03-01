const express = require('express')
const router = express.Router()
const Progress = require('../../models/progress')

router.get('/:userId', async (req, res) => {
  const progress = await Progress.findByUserId(req.params.userId)
  res.json(progress)
})

router.post('/', async (req, res) => {
  const progress = await Progress.createProgress(req.body)
  res.status(201).json(progress)
})

router.put('/', async (req, res) => {
  const progress = await Progress.updateProgress(req.body)
  res.json(progress)
})

module.exports = router